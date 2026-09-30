import crypto from 'crypto';

export interface AuditRecord {
  id: string;
  index: number;
  timestamp: string;
  type: 'CAP_ALERT_DISPATCH' | 'PARAMETRIC_INSURANCE_SETTLEMENT' | 'SYSTEM_CONFIG_CHANGE' | 'SECURITY_EVENT';
  dutyOfficer: string;
  authorizingOfficer?: string;
  details: Record<string, any>;
  payloadHash: string;
  prevHash: string;
  chainHash: string;
  signature: string;
}

// Secret key for HMAC/Signing (in production, loaded from KMS/Secret Manager)
const AUDIT_SECRET = process.env.AUDIT_SIGNING_KEY || 'cycloneshield-ed25519-audit-root-secret-2026';

export class CryptoAuditChain {
  private chain: AuditRecord[] = [];
  private readonly genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

  constructor(initialRecords: AuditRecord[] = []) {
    if (initialRecords.length > 0) {
      this.chain = [...initialRecords];
    }
  }

  /**
   * Appends a new immutable event record to the cryptographic hash chain.
   */
  public append(
    type: AuditRecord['type'],
    dutyOfficer: string,
    details: Record<string, any>,
    authorizingOfficer?: string
  ): AuditRecord {
    const index = this.chain.length;
    const timestamp = new Date().toISOString();
    const id = crypto.randomUUID();
    const prevHash = index === 0 ? this.genesisHash : this.chain[index - 1].chainHash;

    const rawPayload = JSON.stringify({
      id,
      index,
      timestamp,
      type,
      dutyOfficer,
      authorizingOfficer,
      details,
    });

    const payloadHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    // Hash chain: SHA256(prevHash + payloadHash + timestamp)
    const chainHash = crypto
      .createHash('sha256')
      .update(`${prevHash}:${payloadHash}:${timestamp}`)
      .digest('hex');

    // Cryptographic signature over the chain hash
    const signature = crypto
      .createHmac('sha256', AUDIT_SECRET)
      .update(chainHash)
      .digest('hex');

    const record: AuditRecord = {
      id,
      index,
      timestamp,
      type,
      dutyOfficer,
      authorizingOfficer,
      details,
      payloadHash,
      prevHash,
      chainHash,
      signature,
    };

    this.chain.push(record);
    return record;
  }

  /**
   * Verifies the entire cryptographic hash chain for tampering.
   * Returns true if all hashes, links, and signatures are valid.
   */
  public verifyIntegrity(): { isValid: boolean; compromisedIndex?: number; error?: string } {
    for (let i = 0; i < this.chain.length; i++) {
      const record = this.chain[i];
      const expectedPrevHash = i === 0 ? this.genesisHash : this.chain[i - 1].chainHash;

      // Recompute payload hash from actual record data to detect in-memory mutations
      const rawPayload = JSON.stringify({
        id: record.id,
        index: record.index,
        timestamp: record.timestamp,
        type: record.type,
        dutyOfficer: record.dutyOfficer,
        authorizingOfficer: record.authorizingOfficer,
        details: record.details,
      });
      const recomputedPayloadHash = crypto.createHash('sha256').update(rawPayload).digest('hex');
      if (recomputedPayloadHash !== record.payloadHash) {
        return {
          isValid: false,
          compromisedIndex: i,
          error: `Tampered payload details at index ${i}`,
        };
      }

      if (record.prevHash !== expectedPrevHash) {
        return {
          isValid: false,
          compromisedIndex: i,
          error: `Broken hash link at index ${i}: prevHash mismatch`,
        };
      }

      const expectedChainHash = crypto
        .createHash('sha256')
        .update(`${record.prevHash}:${record.payloadHash}:${record.timestamp}`)
        .digest('hex');

      if (record.chainHash !== expectedChainHash) {
        return {
          isValid: false,
          compromisedIndex: i,
          error: `Tampered chain hash at index ${i}`,
        };
      }

      const expectedSig = crypto
        .createHmac('sha256', AUDIT_SECRET)
        .update(record.chainHash)
        .digest('hex');

      if (record.signature !== expectedSig) {
        return {
          isValid: false,
          compromisedIndex: i,
          error: `Invalid signature at index ${i}`,
        };
      }
    }

    return { isValid: true };
  }

  public getRecords(): ReadonlyArray<AuditRecord> {
    return Object.freeze([...this.chain]);
  }

  public getLatestRecord(): AuditRecord | null {
    return this.chain.length > 0 ? this.chain[this.chain.length - 1] : null;
  }
}

export const globalAuditChain = new CryptoAuditChain();
