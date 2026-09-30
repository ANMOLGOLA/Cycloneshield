import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client utility
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory audit trail for CAP Dispatches and Insurance Claims
const auditTrail: Array<{
  id: string;
  timestamp: string;
  type: string;
  details: any;
  hash: string;
}> = [];

// Gemini Model configuration
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// Tool declarations for Gemini
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

// 1. Natural Language Q&A with Function Calling
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!aiClient) {
      // Deterministic geospatial reasoning fallback if API key is not configured
      const reply = generateLocalGeospatialReasoning(prompt, context);
      return res.json({
        text: reply.text,
        citations: reply.citations,
        source: 'local-geocore',
      });
    }

    const systemInstruction = `You are CycloneShield Geospatial Intelligence AI, an operational maritime decision-support advisor for the Bay of Bengal and coastal APAC.
You have direct access to computed data from IMD bulletins, Holland (1980) wind profiles, GLO-30 DEM bathtub surge depths, and OpenStreetMap cascading dependency trees.
Rules:
1. Always base statements on computed data and official IMD/JTWC benchmarks. Never invent or hallucinate casualties or ungrounded statistics.
2. Maintain a calm, authoritative command-center tone.
3. Include specific citations (data layer name and timestamp) behind every factual claim.
4. When relevant, call provided geospatial tools to ground your answers in actual computed numbers.
Current Situation: Cyclone FANI (Category 4 Severe), Central Pressure 938 hPa, Wind 135 kt, Landfall ETA T-18h in Puri. Substation North-Puri tripped, Mahanadi Bridge at risk.`;

    const response = await aiClient.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        tools: [{ functionDeclarations: geospatialTools }],
      },
    });

    const functionCalls = response.functionCalls;
    let toolResults = null;

    if (functionCalls && functionCalls.length > 0 && functionCalls[0].name) {
      // Execute the requested tool locally and synthesize
      toolResults = executeLocalTool(functionCalls[0].name, functionCalls[0].args);
    }

    const textOutput = response.text || (toolResults ? JSON.stringify(toolResults, null, 2) : "Telemetry query processed successfully.");

    return res.json({
      text: textOutput,
      functionCalls,
      toolResults,
      citations: [
        'Copernicus GLO-30 DEM v2024',
        'IMD RSMC New Delhi Bulletin #24',
        'INCOIS Coastal Moored Buoy BD-11 (19.2°N 85.9°E)',
        'OpenStreetMap Overpass Critical Infrastructure Graph'
      ],
      source: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    // Graceful fallback to local engine
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
app.post('/api/gemini/advisory', async (req, res) => {
  try {
    const { districtName, leadTimeHours, severity, languages } = req.body;

    if (!aiClient) {
      const fallbackAdvisories = generateLocalAdvisories(districtName, leadTimeHours, severity);
      return res.json({ advisories: fallbackAdvisories });
    }

    const prompt = `Generate an official Common Alerting Protocol (CAP 1.2) emergency advisory for ${districtName || 'Puri'} District.
Lead Time: T-${leadTimeHours || 18}h. Severity: ${severity || 'Severe'}.
Generate short, crystal-clear warning text with:
1. Headline
2. Description (wind speeds, storm surge depths, wave height)
3. Direct Public Instruction (shelter locations, power cutoff, livestock evacuation)
Translate this into: English, Hindi (हिंदी), Bengali (বাংলা), Odia (ଓଡ଼ିଆ), Telugu (తెలుగు), Tamil (தமிழ்).
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

    return res.json({ advisories: parsed, model: GEMINI_MODEL });
  } catch (err: any) {
    console.error('Gemini advisory error:', err);
    return res.json({ advisories: generateLocalAdvisories(req.body.districtName, req.body.leadTimeHours, req.body.severity) });
  }
});

// 3. Early Warning Dispatch Simulation with Audit Trail
app.post('/api/dispatch/send', (req, res) => {
  const { alertId, channels, dutyOfficer, message } = req.body;

  const idempotencyKey = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const rawPayload = JSON.stringify({ alertId, channels, dutyOfficer, timestamp });
  const hash = crypto.createHash('sha256').update(rawPayload).digest('hex');

  const record = {
    id: idempotencyKey,
    timestamp,
    type: 'CAP_ALERT_DISPATCH',
    details: {
      alertId,
      channels: channels || ['SMS (Twilio)', 'WhatsApp Business', 'Email (SMTP)', 'Civil Siren Webhook'],
      dutyOfficer: dutyOfficer || 'Senior Duty Meteorologist (ID: NDMA-OPS-04)',
      summary: message?.headline || 'Mandatory Evacuation Order Broadcasted',
      deliveryStatus: 'DELIVERED',
      deliveredCount: 482190,
      failedCount: 42,
    },
    hash,
  };

  auditTrail.unshift(record);

  return res.json({
    success: true,
    dispatchRecord: record,
  });
});

// 4. Parametric Insurance Payout Trigger Execution
app.post('/api/insurance/claim', (req, res) => {
  const { districtId, triggerWindKt, triggerSurgeM, observedWindKt, observedSurgeM } = req.body;

  const isTriggerMet = observedWindKt >= triggerWindKt || observedSurgeM >= triggerSurgeM;
  const timestamp = new Date().toISOString();
  const payoutAmountUsd = isTriggerMet ? 14500000 : 0;
  const hash = crypto.createHash('sha256').update(`${districtId}-${timestamp}-${payoutAmountUsd}`).digest('hex');

  const claimRecord = {
    id: crypto.randomUUID(),
    timestamp,
    type: 'PARAMETRIC_INSURANCE_SETTLEMENT',
    details: {
      districtId,
      triggerMet: isTriggerMet,
      payoutAmountUsd,
      oracleFeeds: ['IMD AWS #43012', 'NIOT Moored Buoy BD-11', 'Sentinel-1 SAR Flood Inundation Index'],
      disbursementStatus: isTriggerMet ? 'LIQUIDITY_DISBURSED_TO_DISTRICT_TREASURY' : 'CONDITIONS_UNMET',
    },
    hash,
  };

  auditTrail.unshift(claimRecord);

  return res.json({
    success: true,
    claimRecord,
  });
});

// 5. Audit Log retrieval
app.get('/api/audit/logs', (req, res) => {
  return res.json({ logs: auditTrail });
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
        'State Emergency Grid Telemetry Feed #OD-44'
      ]
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
        'Copernicus GLO-30 DEM'
      ]
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
      'NDMA State Emergency Operations Center Feed'
    ]
  };
}

function generateLocalAdvisories(districtName = 'Puri', leadTimeHours = 18, severity = 'Severe') {
  return {
    English: {
      headline: `MANDATORY EVACUATION ORDER: ${districtName.toUpperCase()} DISTRICT (T-${leadTimeHours}H)`,
      description: `Extremely Severe Cyclonic Storm approaching coast. Sustained winds 135 kt (250 km/h) with 4.8m destructive storm surge flooding coastal zones up to 4 km inland.`,
      instruction: `Move immediately to designated Multipurpose Cyclone Shelters. Fishermen must not venture into the sea. Power supply will be defensively suspended. Follow NDRF personnel instructions.`
    },
    Odia: {
      headline: `ବାଧ୍ୟତାମୂଳକ ସ୍ଥାନାନ୍ତର ନିର୍ଦ୍ଦେଶ: ${districtName} ଜିଲ୍ଲା (T-${leadTimeHours}H)`,
      description: `ଅତ୍ୟନ୍ତ ଭୀଷଣ ବାତ୍ୟା ଉପକୂଳ ଆଡକୁ ଅଗ୍ରସର ହେଉଛି। ପବନର ବେଗ ଘଣ୍ଟା ପ୍ରତି ୨୫୦ କିମି ଏବଂ ୪.୮ ମିଟର ଉଚ୍ଚ ଜୁଆର ଆଶଙ୍କା।`,
      instruction: `ତୁରନ୍ତ ନିକଟସ୍ଥ ବାତ୍ୟା ଆଶ୍ରୟସ୍ଥଳୀକୁ ଯାଆନ୍ତୁ। ସମୁଦ୍ରକୁ ଯାଆନ୍ତୁ ନାହିଁ। ବିଦ୍ୟୁତ୍ ସରବରାହ ବନ୍ଦ ରହିବ। NDRF ନିର୍ଦ୍ଦେଶ ପାଳନ କରନ୍ତୁ।`
    },
    Hindi: {
      headline: `अनिवार्य निकासी आदेश: ${districtName} जिला (T-${leadTimeHours}H)`,
      description: `अत्यंत भीषण चक्रवाती तूफान तट की ओर बढ़ रहा है। 250 किमी/घंटा की रफ्तार से हवाएं और 4.8 मीटर ऊंचा तूफानी ज्वार आने की आशंका।`,
      instruction: `तुरंत निकटतम बहुउद्देश्यीय चक्रवात आश्रय में जाएं। मछुआरे समुद्र में न जाएं। NDRF और प्रशासन के निर्देशों का पालन करें।`
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CycloneShield backend active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
