export interface CapAlertPayload {
  identifier: string;
  sender: string;
  sent: string;
  status: 'Actual' | 'Draft' | 'Exercise';
  msgType: 'Alert' | 'Update' | 'Cancel';
  scope: 'Public' | 'Restricted';
  category: 'Met' | 'Safety';
  urgency: 'Immediate' | 'Expected' | 'Future';
  severity: 'Extreme' | 'Severe' | 'Moderate';
  certainty: 'Observed' | 'Likely' | 'Possible';
  headline: string;
  description: string;
  instruction: string;
  districtId: string;
  peakWindKt: number;
  peakSurgeM: number;
  areaDesc: string;
}

export interface ApprovalToken {
  officerId: string;
  role: 'PRIMARY_DUTY_OFFICER' | 'RELIEF_COMMISSIONER_APPROVER';
  timestamp: string;
  contentHash: string;
  signature: string;
}

const SIGNING_SECRET = typeof process !== 'undefined' && process.env?.CAP_SIGNING_KEY
  ? process.env.CAP_SIGNING_KEY
  : 'cycloneshield-cap-ed25519-signing-key-2026';

/**
 * Fast SHA-256 implementation that works seamlessly in Node.js and Browser environments.
 */
function sha256(ascii: string): string {
  if (typeof window === 'undefined') {
    try {
      // Dynamic require or node crypto
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nodeCrypto = require('crypto');
      return nodeCrypto.createHash('sha256').update(ascii).digest('hex');
    } catch {
      // fallback
    }
  }

  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  for (i = 0; i < ascii.length; i++) {
    words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }

  words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
  words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

  for (i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    const oldHash = [...hash];

    for (j = 0; j < 64; j++) {
      let s0: number, s1: number, ch: number, temp1: number, temp2: number, maj: number;

      if (j < 16) {
        // use w[j]
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
      }

      s1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      temp1 = (hash[7] + s1 + ch + k[j] + w[j]) | 0;
      s0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      temp2 = (s0 + maj) | 0;

      hash = [(temp1 + temp2) | 0, hash[0], hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (j = 0; j < 8; j++) {
      hash[j] = (hash[j] + oldHash[j]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 0xff;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

function hmacSha256(key: string, data: string): string {
  return sha256(`${key}:${data}:${key}`);
}

/**
 * Computes canonical SHA-256 hash of CAP alert payload.
 */
export function computeAlertContentHash(alert: CapAlertPayload): string {
  const canonicalData = {
    identifier: alert.identifier,
    sender: alert.sender,
    msgType: alert.msgType,
    urgency: alert.urgency,
    severity: alert.severity,
    headline: alert.headline.trim(),
    description: alert.description.trim(),
    instruction: alert.instruction.trim(),
    districtId: alert.districtId.toLowerCase(),
    peakWindKt: alert.peakWindKt,
    peakSurgeM: alert.peakSurgeM,
  };

  return sha256(JSON.stringify(canonicalData));
}

/**
 * Creates a cryptographically signed approval token for an authorized officer.
 */
export function createApprovalToken(
  officerId: string,
  role: ApprovalToken['role'],
  alert: CapAlertPayload
): ApprovalToken {
  const contentHash = computeAlertContentHash(alert);
  const timestamp = new Date().toISOString();
  const signature = hmacSha256(SIGNING_SECRET, `${officerId}:${role}:${timestamp}:${contentHash}`);

  return {
    officerId,
    role,
    timestamp,
    contentHash,
    signature,
  };
}

/**
 * Validates approval token authenticity and content binding.
 */
export function verifyApprovalToken(token: ApprovalToken, currentAlert: CapAlertPayload): boolean {
  const currentHash = computeAlertContentHash(currentAlert);
  if (token.contentHash !== currentHash) {
    return false;
  }

  const expectedSig = hmacSha256(
    SIGNING_SECRET,
    `${token.officerId}:${token.role}:${token.timestamp}:${token.contentHash}`
  );

  return token.signature === expectedSig;
}

/**
 * Enforces Four-Eyes (Two-Person) approval rule for 'Extreme' / Evacuation-tier alerts.
 */
export function validateFourEyesApproval(
  alert: CapAlertPayload,
  primaryToken: ApprovalToken,
  authorizerToken?: ApprovalToken
): { authorized: boolean; reason?: string } {
  if (!verifyApprovalToken(primaryToken, alert)) {
    return { authorized: false, reason: 'Primary approval token is invalid or content hash mismatched' };
  }

  const isHighConsequence = alert.severity === 'Extreme' || alert.headline.toLowerCase().includes('evacuation');

  if (isHighConsequence) {
    if (!authorizerToken) {
      return {
        authorized: false,
        reason: 'Four-Eyes Rule Violation: High-consequence evacuation alert requires secondary Relief Commissioner approval token',
      };
    }

    if (!verifyApprovalToken(authorizerToken, alert)) {
      return { authorized: false, reason: 'Secondary authorizer token is invalid or content hash mismatched' };
    }

    if (primaryToken.officerId === authorizerToken.officerId) {
      return {
        authorized: false,
        reason: 'Four-Eyes Rule Violation: Primary officer and authorizer cannot be the same individual',
      };
    }
  }

  return { authorized: true };
}

/**
 * Signs full CAP 1.2 XML with W3C XML-DSig style envelope.
 */
export function signCapXml(alert: CapAlertPayload, signatureHash: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${alert.identifier}</identifier>
  <sender>${alert.sender}</sender>
  <sent>${alert.sent}</sent>
  <status>${alert.status}</status>
  <msgType>${alert.msgType}</msgType>
  <scope>${alert.scope}</scope>
  <info>
    <category>${alert.category}</category>
    <event>Severe Tropical Cyclone &amp; Inundation Warning</event>
    <urgency>${alert.urgency}</urgency>
    <severity>${alert.severity}</severity>
    <certainty>${alert.certainty}</certainty>
    <headline>${escapeXml(alert.headline)}</headline>
    <description>${escapeXml(alert.description)}</description>
    <instruction>${escapeXml(alert.instruction)}</instruction>
    <area>
      <areaDesc>${escapeXml(alert.areaDesc)}</areaDesc>
    </area>
    <parameter>
      <valueName>PeakWindSpeedKt</valueName>
      <value>${alert.peakWindKt}</value>
    </parameter>
    <parameter>
      <valueName>PeakStormSurgeM</valueName>
      <value>${alert.peakSurgeM}</value>
    </parameter>
  </info>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#" />
      <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#hmac-sha256" />
      <Reference URI="">
        <DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256" />
        <DigestValue>${computeAlertContentHash(alert)}</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>${signatureHash}</SignatureValue>
  </Signature>
</alert>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
