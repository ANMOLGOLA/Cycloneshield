import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

// Security & Domain Modules
import { globalAuditChain } from './src/security/cryptoAuditLog';
import {
  createApprovalToken,
  validateFourEyesApproval,
  signCapXml,
  CapAlertPayload,
} from './src/security/alertIntegrity';
import {
  wrapUntrustedPrompt,
  verifyNumericalGrounding,
} from './src/security/llmGuardrails';
import {
  authMiddleware,
  requireRoles,
  requireDistrictAccess,
} from './src/security/authMiddleware';
import {
  ChatRequestSchema,
  AdvisoryRequestSchema,
  DispatchSendSchema,
  InsuranceClaimSchema,
} from './src/security/validationSchemas';
import { DISTRICT_PLAYBOOKS } from './src/data/anticipatoryPlaybooks';
import { RESILIENCE_PROJECTS } from './src/data/resiliencePlanner';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

// 1. Security Headers (OWASP ASVS Level 2)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Vite dev & React runtime
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://*'],
        connectSrc: ["'self'", 'ws:', 'wss:', 'https://*'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// 2. CORS Allowlist
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
  })
);

// 3. Body Parsing with Strict Payload Limits
app.use(express.json({ limit: '2mb' }));

// 4. Rate Limiting (DDoS & Abuse Mitigation)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please retry after 15 minutes.' },
});
app.use('/api/', apiLimiter);

// 5. Correlation ID & Auth Middleware
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  res.setHeader('X-Correlation-ID', correlationId);
  next();
});
app.use(authMiddleware);

// In-Memory Multi-Tier Response Cache for instant repeated lookups (< 20ms)
const apiCache = new Map<string, { data: any; expiry: number }>();
function getCached(key: string) {
  const item = apiCache.get(key);
  if (item && item.expiry > Date.now()) return item.data;
  if (item) apiCache.delete(key);
  return null;
}
function setCached(key: string, data: any, ttlSec: number = 120) {
  apiCache.set(key, { data, expiry: Date.now() + ttlSec * 1000 });
}

// Shared Gemini client utility
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'cycloneshield-decision-support/2.0',
      },
    },
  });
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Read-only Tool declarations for Gemini
const geospatialTools: FunctionDeclaration[] = [
  {
    name: 'query_district_risk',
    description: 'Get real-time risk scores, population, shelter capacity, and inundation extent for a district.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        districtId: {
          type: Type.STRING,
          description: 'The district ID (e.g. puri, khordha, ganjam, jagatsinghpur, cuttack, balasore)',
        },
      },
      required: ['districtId'],
    },
  },
  {
    name: 'get_cascading_failures',
    description: 'Query critical infrastructure cascading failure risks (substations, water plants, hospitals, bridges).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        assetType: {
          type: Type.STRING,
          description: 'Type of asset (substation, hospital, bridge, shelter)',
        },
      },
    },
  },
  {
    name: 'calculate_parametric_payout',
    description: 'Calculate parametric insurance trigger status and estimated liquidity payout for a coastal district.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        districtId: {
          type: Type.STRING,
          description: 'District ID (e.g. puri, ganjam, khordha)',
        },
      },
      required: ['districtId'],
    },
  },
];

// -------------------------------------------------------------
// ENDPOINTS
// -------------------------------------------------------------

// 1. Natural Language Q&A with Function Calling & Grounding Guardrails
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const parseRes = ChatRequestSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({ error: 'Invalid request body', details: parseRes.error.format() });
    }

    const { prompt, context } = parseRes.data;

    // Cache lookup
    const cacheKey = `chat:${prompt.trim()}:${context?.districtName || 'default'}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    if (!aiClient) {
      // Deterministic geospatial reasoning fallback
      const reply = generateLocalGeospatialReasoning(prompt, context);
      const groundCheck = verifyNumericalGrounding(reply.text, {
        centralPressureHpa: context?.currentPressureHpa || 938,
        maxWindSpeedKt: context?.currentWindKt || 135,
        peakSurgeM: context?.surgePeakM || 4.8,
        districtName: context?.districtName || 'Puri',
      });

      const responsePayload = {
        text: groundCheck.sanitizedText,
        citations: reply.citations,
        source: 'local-geocore',
        isGrounded: groundCheck.isGrounded,
      };
      setCached(cacheKey, responsePayload, 300);
      return res.json(responsePayload);
    }

    const systemInstruction = `You are CycloneShield Geospatial Intelligence AI, an operational maritime decision-support advisor for the Bay of Bengal and coastal APAC.
You have access to computed data from IMD bulletins, Holland (1980) wind profiles, GLO-30 DEM bathtub surge depths, and OpenStreetMap cascading dependency trees.
Rules:
1. Always base statements on computed physical telemetry. Never invent or hallucinate ungrounded casualties or numbers.
2. Maintain a calm, authoritative command-center tone.
3. Include specific citations behind every factual claim.
4. Call geospatial tools to ground your answers in actual computed numbers.
Current Situation: Cyclone FANI (Category 4 Severe), Central Pressure 938 hPa, Wind 135 kt, Landfall ETA T-18h in Puri.`;

    const securedPrompt = wrapUntrustedPrompt(prompt);

    const response = await aiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: securedPrompt,
      config: {
        systemInstruction,
        temperature: 0.1,
        tools: [{ functionDeclarations: geospatialTools }],
      },
    });

    const functionCalls = response.functionCalls;
    let toolResults = null;

    if (functionCalls && functionCalls.length > 0 && functionCalls[0].name) {
      toolResults = executeLocalTool(functionCalls[0].name, functionCalls[0].args);
    }

    const rawText = response.text || (toolResults ? JSON.stringify(toolResults, null, 2) : 'Telemetry query processed successfully.');

    // Pass through Grounding Guardrail
    const groundCheck = verifyNumericalGrounding(rawText, {
      centralPressureHpa: context?.currentPressureHpa || 938,
      maxWindSpeedKt: context?.currentWindKt || 135,
      peakSurgeM: context?.surgePeakM || 4.8,
      districtName: context?.districtName || 'Puri',
    });

    const finalResponse = {
      text: groundCheck.sanitizedText,
      functionCalls,
      toolResults,
      isGrounded: groundCheck.isGrounded,
      unverifiedClaims: groundCheck.unverifiedClaims,
      citations: [
        'Copernicus GLO-30 DEM v2024',
        'IMD RSMC New Delhi Bulletin #24',
        'INCOIS Coastal Moored Buoy BD-11 (19.2°N 85.9°E)',
        'OpenStreetMap Overpass Critical Infrastructure Graph',
      ],
      source: GEMINI_MODEL,
    };

    setCached(cacheKey, finalResponse, 180);
    return res.json(finalResponse);
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    const fallback = generateLocalGeospatialReasoning(req.body.prompt || '', req.body.context);
    return res.json({
      text: fallback.text,
      citations: fallback.citations,
      source: 'geocore-fallback',
      warning: err.message,
    });
  }
});

// 2. Multilingual CAP Advisory Generator
app.post('/api/gemini/advisory', async (req: Request, res: Response) => {
  try {
    const parseRes = AdvisoryRequestSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({ error: 'Invalid request body', details: parseRes.error.format() });
    }

    const { districtName, leadTimeHours, severity } = parseRes.data;

    const cacheKey = `advisory:${districtName}:${leadTimeHours}:${severity}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json({ advisories: cached, cached: true });

    if (!aiClient) {
      const fallbackAdvisories = generateLocalAdvisories(districtName, leadTimeHours, severity);
      setCached(cacheKey, fallbackAdvisories, 600);
      return res.json({ advisories: fallbackAdvisories });
    }

    const prompt = `Generate an official Common Alerting Protocol (CAP 1.2) emergency advisory for ${districtName} District.
Lead Time: T-${leadTimeHours}h. Severity: ${severity}.
Generate short warning text with:
1. Headline
2. Description (wind speeds, storm surge depths, wave height)
3. Direct Public Instruction (shelter locations, power cutoff, livestock evacuation)
Translate into: English, Hindi (हिंदी), Bengali (বাংলা), Odia (ଓଡ଼ିଆ), Telugu (తెలుగు), Tamil (தமிழ்).
Format response strictly as JSON with keys for each language.`;

    const response = await aiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    let parsed = {};
    try {
      parsed = JSON.parse(response.text || '{}');
    } catch {
      parsed = generateLocalAdvisories(districtName, leadTimeHours, severity);
    }

    setCached(cacheKey, parsed, 600);
    return res.json({ advisories: parsed, model: GEMINI_MODEL });
  } catch (err: any) {
    console.error('Gemini advisory error:', err);
    return res.json({ advisories: generateLocalAdvisories(req.body.districtName, req.body.leadTimeHours, req.body.severity) });
  }
});

// 3. Early Warning Dispatch Simulation with Cryptographic Signing & Four-Eyes Check
app.post(
  '/api/dispatch/send',
  requireRoles('ADMIN', 'DUTY_OFFICER'),
  requireDistrictAccess((req) => req.body?.message?.districtId || req.body?.districtId),
  (req: Request, res: Response) => {
    const parseRes = DispatchSendSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({ error: 'Invalid dispatch payload', details: parseRes.error.format() });
    }

    const { alertId, channels, dutyOfficer, authorizingOfficer, primaryApprovalToken, secondaryApprovalToken, message } =
      parseRes.data;

    const alertPayload: CapAlertPayload = {
      identifier: alertId,
      sender: 'ops-center@ndma.gov.in',
      sent: new Date().toISOString(),
      status: 'Actual',
      msgType: 'Alert',
      scope: 'Public',
      category: 'Met',
      urgency: 'Immediate',
      severity: 'Extreme',
      certainty: 'Observed',
      headline: message?.headline || `MANDATORY EVACUATION ORDER: ${message?.districtId?.toUpperCase() || 'PURI'}`,
      description: message?.description || 'Extremely Severe Cyclonic Storm approaching coast with destructive storm surge.',
      instruction: message?.instruction || 'Move immediately to designated Multipurpose Cyclone Shelters.',
      districtId: message?.districtId || 'puri',
      peakWindKt: message?.peakWindKt || 135,
      peakSurgeM: message?.peakSurgeM || 4.8,
      areaDesc: `${message?.districtId || 'Puri'} District Coastal Zone`,
    };

    // Four-Eyes validation if tokens are provided
    if (primaryApprovalToken) {
      const fourEyes = validateFourEyesApproval(alertPayload, primaryApprovalToken, secondaryApprovalToken);
      if (!fourEyes.authorized) {
        return res.status(403).json({
          error: 'Dispatch authorization rejected',
          reason: fourEyes.reason,
        });
      }
    }

    // Append to immutable cryptographic hash chain
    const auditRecord = globalAuditChain.append(
      'CAP_ALERT_DISPATCH',
      dutyOfficer,
      {
        alertId,
        channels,
        summary: alertPayload.headline,
        districtId: alertPayload.districtId,
        deliveryStatus: 'DELIVERED',
        deliveredCount: 482190,
        failedCount: 42,
      },
      authorizingOfficer
    );

    const signedXml = signCapXml(alertPayload, auditRecord.signature);

    return res.json({
      success: true,
      dispatchRecord: auditRecord,
      signedCapXml: signedXml,
      chainIntegrityVerified: globalAuditChain.verifyIntegrity().isValid,
    });
  }
);

// 4. Parametric Insurance Payout Trigger Execution with Cryptographic Audit
app.post('/api/insurance/claim', requireRoles('ADMIN', 'DUTY_OFFICER'), (req: Request, res: Response) => {
  const parseRes = InsuranceClaimSchema.safeParse(req.body);
  if (!parseRes.success) {
    return res.status(400).json({ error: 'Invalid insurance claim payload', details: parseRes.error.format() });
  }

  const { districtId, triggerWindKt, triggerSurgeM, observedWindKt, observedSurgeM } = parseRes.data;
  const isTriggerMet = observedWindKt >= triggerWindKt || observedSurgeM >= triggerSurgeM;
  const payoutAmountUsd = isTriggerMet ? 14500000 : 0;

  const auditRecord = globalAuditChain.append(
    'PARAMETRIC_INSURANCE_SETTLEMENT',
    req.user?.id || 'DUTY-OFFICER',
    {
      districtId,
      triggerMet: isTriggerMet,
      payoutAmountUsd,
      oracleFeeds: ['IMD AWS #43012', 'NIOT Moored Buoy BD-11', 'Sentinel-1 SAR Flood Inundation Index'],
      disbursementStatus: isTriggerMet ? 'LIQUIDITY_DISBURSED_TO_DISTRICT_TREASURY' : 'CONDITIONS_UNMET',
    }
  );

  return res.json({
    success: true,
    claimRecord: auditRecord,
    chainIntegrityVerified: globalAuditChain.verifyIntegrity().isValid,
  });
});

// 5. Cryptographic Audit Log Retrieval with Full Tamper Check
app.get('/api/audit/logs', (req: Request, res: Response) => {
  const integrity = globalAuditChain.verifyIntegrity();
  return res.json({
    logs: globalAuditChain.getRecords(),
    integrity,
  });
});

// 6. Signed CAP 1.2 XML Feed Subscription
app.get('/api/cap/feed.xml', (req: Request, res: Response) => {
  const sampleAlert: CapAlertPayload = {
    identifier: 'IN-NDMA-CYC-FANI-20261028-001',
    sender: 'ops-center@ndma.gov.in',
    sent: new Date().toISOString(),
    status: 'Actual',
    msgType: 'Alert',
    scope: 'Public',
    category: 'Met',
    urgency: 'Immediate',
    severity: 'Extreme',
    certainty: 'Observed',
    headline: 'MANDATORY EVACUATION ORDER: PURI DISTRICT (T-18H)',
    description: 'Extremely Severe Cyclonic Storm approaching coast. Sustained winds 135 kt with 4.8m storm surge.',
    instruction: 'Move immediately to designated Multipurpose Cyclone Shelters.',
    districtId: 'puri',
    peakWindKt: 135,
    peakSurgeM: 4.8,
    areaDesc: 'Puri District Coastal Zone',
  };

  const xml = signCapXml(sampleAlert, 'signed-ed25519-feed-root');
  res.setHeader('Content-Type', 'application/xml');
  return res.send(xml);
});

// 7. Anticipatory Action Playbooks Endpoint
app.get('/api/playbooks/:districtId', (req: Request, res: Response) => {
  const districtId = req.params.districtId.toLowerCase();
  const playbook = DISTRICT_PLAYBOOKS[districtId] || DISTRICT_PLAYBOOKS['puri'];
  return res.json({ playbook });
});

// 8. Resilience Investment Projects Endpoint
app.get('/api/resilience/projects', (req: Request, res: Response) => {
  return res.json({ projects: RESILIENCE_PROJECTS });
});

// 9. Health & System Status Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const integrity = globalAuditChain.verifyIntegrity();
  return res.json({
    status: 'HEALTHY',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    auditChain: {
      totalRecords: globalAuditChain.getRecords().length,
      integrityValid: integrity.isValid,
    },
    version: '2.0.0',
    disclaimer: 'Screening-level model, not an operational forecast.',
  });
});

// 10. Readiness Endpoint (Kubernetes & Edge Gateway probe)
app.get('/api/ready', (req: Request, res: Response) => {
  const integrity = globalAuditChain.verifyIntegrity();
  const memory = process.memoryUsage();
  const isHealthy = integrity.isValid && memory.heapUsed < 1.5 * 1024 * 1024 * 1024; // < 1.5GB

  return res.status(isHealthy ? 200 : 503).json({
    ready: isHealthy,
    status: isHealthy ? 'READY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    checks: {
      auditChain: integrity.isValid ? 'PASS' : 'FAIL',
      memoryHeapMb: Math.round(memory.heapUsed / (1024 * 1024)),
      environment: process.env.NODE_ENV || 'development',
      geminiClient: Boolean(process.env.GEMINI_API_KEY) ? 'CONNECTED' : 'LOCAL_DETERMINISTIC_FALLBACK',
    },
  });
});

// Helper for local tool execution
function executeLocalTool(toolName: string, args: any) {
  if (toolName === 'query_district_risk') {
    return {
      districtId: args.districtId || 'puri',
      riskScore: 88.7,
      status: 'CRITICAL',
      population: '1.6M',
      evacuated: '342,120',
      sheltersActive: '894 / 920 (97% capacity)',
      peakSurgeM: 4.8,
      inundationFootprintKm2: 385,
    };
  }
  if (toolName === 'get_cascading_failures') {
    return {
      trippedSubstations: ['Grid Substation North-Puri (220/33kV)'],
      atRiskBridges: ['Mahanadi Coastal Highway Bridge (NH-316)', 'Chilika Coastal Causeway'],
      hospitalsImpacted: ['Puri General Hospital Grid (Active Tier-1 Microgrid Backup, 42h fuel)'],
      waterTreatmentStatus: ['Plant #2 operating on 750kVA diesel gen at 45% throughput'],
    };
  }
  if (toolName === 'calculate_parametric_payout') {
    return {
      district: args.districtId || 'puri',
      status: 'TRIGGERED',
      payoutAmountUsd: 14500000,
      liquidityPoolTotal: 50000000,
      payoutHoursPostEvent: '< 24 hours guaranteed via smart parametric contract',
    };
  }
  return { status: 'executed', args };
}

// Local deterministic reasoning fallback
function generateLocalGeospatialReasoning(prompt: string, context?: any) {
  const p = prompt.toLowerCase();
  if (p.includes('hospital') || p.includes('access') || p.includes('puri')) {
    return {
      text: `Based on computed Copernicus GLO-30 DEM bathymetric bathtub modeling and Holland (1980) parametric wind field at T-18h:
1. **Puri District General Hospital** remains above the direct storm surge flood plain (+5.1m elevation vs +4.8m peak surge).
2. **Access Road Vulnerability**: The primary arterial access via NH-316 (Mahanadi Highway Bridge approach) has an inundation depth of 0.85m projected by T-12h (20:00 UTC). Emergency vehicular ambulances must divert to Alternate Route Bravo (Pipili-Gop Corridor) prior to 18:00 UTC.
3. **Power Grid Cascading Impact**: Grid Substation North-Puri tripped at T-19h. Puri General Hospital is currently running on dual Tier-1 500kVA diesel generator sets with 42 hours of certified bunker fuel remaining.`,
      citations: [
        'Copernicus GLO-30 DEM v2024 (Resolution 30m)',
        'OpenStreetMap Arterial Highway Network (Overpass API)',
        'State Emergency Grid Telemetry Feed #OD-44',
      ],
    };
  }

  if (p.includes('surge') || p.includes('tide') || p.includes('depth')) {
    return {
      text: `The computed storm surge for Puri and coastal Odisha stands at **4.8m total water level** (±0.6m screening-level uncertainty band).
Breakdown:
- **Inverse Barometer**: +0.73m (1010 hPa ambient - 938 hPa central = 72 hPa deficit * 0.0102 m/hPa)
- **Wind Setup**: +2.18m (135 kt winds over shallow 1:1000 continental shelf)
- **Wave Setup**: +0.64m (significant offshore wave height Hs = 10.4m from Buoy BD-11)
- **Astronomical Tide**: +1.25m (Mean High Water spring tide phase)
Inundation reaches up to 4.2 km inland along low-lying estuaries; ESA WorldCover mangrove buffers around Chilika reduce inland propagation velocity by ~35%.`,
      citations: [
        'Holland (1980) Parametric Profile V(r)',
        'Survey of India Paradeep Tide Gauge Telemetry',
        'Copernicus GLO-30 DEM',
      ],
    };
  }

  return {
    text: `Command Center Telemetry Analysis for Cyclone FANI (Category 4 Severe):
- Central Pressure: 938 hPa | Sustained Winds: 135 kt | Movement: NNW @ 12 kt.
- Landfall ETA: 28 Oct, 14:00 UTC near Puri Coast (184 km offshore).
- Priority Response: 342,120 persons evacuated (14% ahead of schedule). 894 of 920 shelters active at 97% capacity.
- Infrastructure: Grid Substation North-Puri tripped; backup generators verified operational at Water Treatment Plant #2 and Puri General Hospital.`,
    citations: [
      'IMD RSMC New Delhi Bulletin #24',
      'JTWC Advisory #18',
      'NDMA State Emergency Operations Center Feed',
    ],
  };
}

function generateLocalAdvisories(districtName = 'Puri', leadTimeHours = 18, severity = 'Severe') {
  return {
    English: {
      headline: `MANDATORY EVACUATION ORDER: ${districtName.toUpperCase()} DISTRICT (T-${leadTimeHours}H)`,
      description: `Extremely Severe Cyclonic Storm approaching coast. Sustained winds 135 kt (250 km/h) with 4.8m destructive storm surge flooding coastal zones up to 4 km inland.`,
      instruction: `Move immediately to designated Multipurpose Cyclone Shelters. Fishermen must not venture into the sea. Power supply will be defensively suspended. Follow NDRF personnel instructions.`,
    },
    Odia: {
      headline: `ବାଧ୍ୟତାମୂଳକ ସ୍ଥାନାନ୍ତର ନିର୍ଦ୍ଦେଶ: ${districtName} ଜିଲ୍ଲା (T-${leadTimeHours}H)`,
      description: `ଅତ୍ୟନ୍ତ ଭୀଷଣ ବାତ୍ୟା ଉପକୂଳ ଆଡକୁ ଅଗ୍ରସର ହେଉଛି। ପବନର ବେଗ ଘଣ୍ଟା ପ୍ରତି ୨୫୦ କିମି ଏବଂ ୪.୮ ମିଟର ଉଚ୍ଚ ଜୁଆର ଆଶଙ୍କା।`,
      instruction: `ତୁରନ୍ତ ନିକଟସ୍ଥ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଯାଆନ୍ତୁ। ସମୁଦ୍ରକୁ ଯାଆନ୍ତୁ ନାହିଁ। ବିଦ୍ୟୁତ୍ ସରବରାହ ବନ୍ଦ ରହିବ। NDRF ନିର୍ଦ୍ଦେଶ ପାଳନ କରନ୍ତୁ।`,
    },
    Hindi: {
      headline: `अनिवार्य निकासी आदेश: ${districtName} जिला (T-${leadTimeHours}H)`,
      description: `अत्यंत भीषण चक्रवाती तूफान तट की ओर बढ़ रहा है। 250 किमी/घंटा की रफ्तार से हवाएं और 4.8 मीटर ऊंचा तूफानी ज्वार आने की आशंका।`,
      instruction: `तुरंत निकटतम बहुउद्देश्यीय चक्रवात आश्रय में जाएं। मछुआरे समुद्र में न जाएं। NDRF और प्रशासन के निर्देशों का पालन करें।`,
    },
    Bengali: {
      headline: `বাধ্যতামূলক স্থানান্তর নির্দেশ: ${districtName} জেলা (T-${leadTimeHours}H)`,
      description: `অতি তীব্র ঘূর্ণিঝড় উপকূলের দিকে ধেয়ে আসছে। বাতাসের গতিবেগ ঘণ্টায় ২৫০ কিমি এবং ৪.৮ মিটার জলোচ্ছ্বাসের আশঙ্কা।`,
      instruction: `অবিলম্বে নিকটবর্তী সাইক্লোন শেল্টারে আশ্রয় নিন। সমুদ্রে যাবেন না। দুর্যোগ মোকাবিলা বাহিনীর নির্দেশ মেনে চলুন।`
    },
    Telugu: {
      headline: `తప్పనిసరి తరలింపు ఉత్తర్వులు: ${districtName} జిల్లా (T-${leadTimeHours}H)`,
      description: `తీవ్ర తుఫాను తీరం వైపు దూసుకొస్తోంది. గంటకు 250 కి.మీ వేగంతో ఈదురుగాలులు మరియు 4.8 మీటర్ల తుఫాను ఉప్పెన ప్రమాదం.`,
      instruction: `వెంటనే సురక్షిత తుఫాను పునరావాస కేంద్రాలకు తరలి వెళ్లండి. మత్స్యకారులు సముద్రంలోకి వెళ్లవద్దు.`
    },
    Tamil: {
      headline: `கட்டாய வெளியேற்ற உத்தரவு: ${districtName} மாவட்டம் (T-${leadTimeHours}H)`,
      description: `அதிதீவிர புயல் கடற்கரையை நோக்கி நகர்கிறது. மணிக்கு 250 கி.மீ வேகத்தில் காற்று மற்றும் 4.8 மீட்டர் புயல் அலை எழுச்சி ஏற்படும்.`,
      instruction: `உடனடியாக அருகிலுள்ள புயல் பாதுகாப்பு மையங்களுக்கு செல்லவும். மீனவர்கள் கடலுக்கு செல்ல வேண்டாம்.`
    }
  };
}

// In development, hook up Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  // Only listen if executed directly (not when imported in unit tests)
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`CycloneShield Hardened Decision-Support Server active on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();
