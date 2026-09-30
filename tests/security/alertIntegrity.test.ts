import { describe, it, expect } from 'vitest';
import {
  CapAlertPayload,
  computeAlertContentHash,
  createApprovalToken,
  verifyApprovalToken,
  validateFourEyesApproval,
  signCapXml,
} from '../../src/security/alertIntegrity';

describe('CAP 1.2 Alert Integrity & Four-Eyes Authorization', () => {
  const sampleAlert: CapAlertPayload = {
    identifier: 'IN-NDMA-CYC-FANI-20261028-001',
    sender: 'ops-center@ndma.gov.in',
    sent: '2026-10-28T14:00:00Z',
    status: 'Actual',
    msgType: 'Alert',
    scope: 'Public',
    category: 'Met',
    urgency: 'Immediate',
    severity: 'Extreme',
    certainty: 'Observed',
    headline: 'MANDATORY EVACUATION ORDER: PURI DISTRICT (T-18H)',
    description: 'Extremely Severe Cyclonic Storm approaching coast with 135 kt winds and 4.8m storm surge.',
    instruction: 'Move immediately to designated Multipurpose Cyclone Shelters.',
    districtId: 'puri',
    peakWindKt: 135,
    peakSurgeM: 4.8,
    areaDesc: 'Puri District Coastal Zone',
  };

  it('computes repeatable deterministic content hash', () => {
    const hash1 = computeAlertContentHash(sampleAlert);
    const hash2 = computeAlertContentHash({ ...sampleAlert });
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64);
  });

  it('generates and verifies valid approval tokens', () => {
    const token = createApprovalToken('OFFICER-01', 'PRIMARY_DUTY_OFFICER', sampleAlert);
    expect(verifyApprovalToken(token, sampleAlert)).toBe(true);
  });

  it('invalidates approval token if alert text or numbers are modified post-approval', () => {
    const token = createApprovalToken('OFFICER-01', 'PRIMARY_DUTY_OFFICER', sampleAlert);

    // Attacker modifies surge depth from 4.8m to 1.2m
    const tamperedAlert = { ...sampleAlert, peakSurgeM: 1.2 };
    expect(verifyApprovalToken(token, tamperedAlert)).toBe(false);

    // Attacker modifies headline text
    const textTamperedAlert = { ...sampleAlert, headline: 'NON-MANDATORY ADVISORY' };
    expect(verifyApprovalToken(token, textTamperedAlert)).toBe(false);
  });

  it('enforces Four-Eyes rule: Extreme/Evacuation alert requires secondary authorizer', () => {
    const primaryToken = createApprovalToken('OFFICER-01', 'PRIMARY_DUTY_OFFICER', sampleAlert);

    // Missing secondary token
    const singleOfficerCheck = validateFourEyesApproval(sampleAlert, primaryToken);
    expect(singleOfficerCheck.authorized).toBe(false);
    expect(singleOfficerCheck.reason).toContain('Four-Eyes Rule Violation');

    // Same officer cannot sign both tokens
    const sameOfficerToken = createApprovalToken('OFFICER-01', 'RELIEF_COMMISSIONER_APPROVER', sampleAlert);
    const sameOfficerCheck = validateFourEyesApproval(sampleAlert, primaryToken, sameOfficerToken);
    expect(sameOfficerCheck.authorized).toBe(false);
    expect(sameOfficerCheck.reason).toContain('Primary officer and authorizer cannot be the same individual');

    // Distinct secondary authorizer
    const validAuthorizerToken = createApprovalToken('COMMISSIONER-01', 'RELIEF_COMMISSIONER_APPROVER', sampleAlert);
    const validFourEyes = validateFourEyesApproval(sampleAlert, primaryToken, validAuthorizerToken);
    expect(validFourEyes.authorized).toBe(true);
  });

  it('generates signed CAP 1.2 XML with Signature block', () => {
    const token = createApprovalToken('OFFICER-01', 'PRIMARY_DUTY_OFFICER', sampleAlert);
    const signedXml = signCapXml(sampleAlert, token.signature);
    expect(signedXml).toContain('<Signature xmlns="http://www.w3.org/2000/09/xmldsig#">');
    expect(signedXml).toContain(sampleAlert.identifier);
    expect(signedXml).toContain(token.contentHash);
  });
});
