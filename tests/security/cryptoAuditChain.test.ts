import { describe, it, expect } from 'vitest';
import { CryptoAuditChain } from '../../src/security/cryptoAuditLog';

describe('Cryptographic Append-Only Audit Chain', () => {
  it('creates sequential valid hash chain records', () => {
    const chain = new CryptoAuditChain();
    const r1 = chain.append('CAP_ALERT_DISPATCH', 'NDMA-OPS-01', { alertId: 'ALERT-001', district: 'puri' });
    const r2 = chain.append('PARAMETRIC_INSURANCE_SETTLEMENT', 'NDMA-OPS-02', { claimId: 'CLM-001', amountUsd: 14500000 });

    expect(r1.index).toBe(0);
    expect(r2.index).toBe(1);
    expect(r2.prevHash).toBe(r1.chainHash);

    const verification = chain.verifyIntegrity();
    expect(verification.isValid).toBe(true);
  });

  it('detects tampering if a past record payload is altered in storage', () => {
    const chain = new CryptoAuditChain();
    chain.append('CAP_ALERT_DISPATCH', 'NDMA-OPS-01', { district: 'puri', peakSurgeM: 4.8 });
    chain.append('CAP_ALERT_DISPATCH', 'NDMA-OPS-01', { district: 'ganjam', peakSurgeM: 3.2 });

    const records = (chain as any).chain;
    // Maliciously tamper with record 0
    records[0].details.peakSurgeM = 1.0;

    const verification = chain.verifyIntegrity();
    expect(verification.isValid).toBe(false);
    expect(verification.compromisedIndex).toBe(0);
  });

  it('detects tampering if a chainHash or link is modified', () => {
    const chain = new CryptoAuditChain();
    chain.append('CAP_ALERT_DISPATCH', 'NDMA-OPS-01', { district: 'puri' });
    chain.append('CAP_ALERT_DISPATCH', 'NDMA-OPS-02', { district: 'ganjam' });

    const records = (chain as any).chain;
    records[1].prevHash = 'badhash0000000000000000000000000000000000000000000000000000000000';

    const verification = chain.verifyIntegrity();
    expect(verification.isValid).toBe(false);
    expect(verification.compromisedIndex).toBe(1);
  });
});
