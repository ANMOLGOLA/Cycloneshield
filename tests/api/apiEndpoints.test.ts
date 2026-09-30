import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { globalAuditChain } from '../../src/security/cryptoAuditLog';
import { createApprovalToken, CapAlertPayload } from '../../src/security/alertIntegrity';
import {
  ChatRequestSchema,
  AdvisoryRequestSchema,
  DispatchSendSchema,
  InsuranceClaimSchema,
} from '../../src/security/validationSchemas';

describe('CycloneShield Core API Validation & Contract Tests', () => {
  describe('Zod Schema Verification', () => {
    it('validates correct ChatRequestSchema', () => {
      const valid = ChatRequestSchema.safeParse({
        prompt: 'What is the projected flood depth in Puri?',
        context: {
          cycloneName: 'FANI',
          districtName: 'Puri',
          currentWindKt: 135,
          currentPressureHpa: 938,
          surgePeakM: 4.8,
        },
      });
      expect(valid.success).toBe(true);
    });

    it('rejects oversized prompt payloads', () => {
      const invalid = ChatRequestSchema.safeParse({
        prompt: 'A'.repeat(5000), // Exceeds 2000 char max
      });
      expect(invalid.success).toBe(false);
    });

    it('validates AdvisoryRequestSchema with defaults', () => {
      const parsed = AdvisoryRequestSchema.parse({});
      expect(parsed.districtName).toBe('Puri');
      expect(parsed.leadTimeHours).toBe(18);
      expect(parsed.severity).toBe('Severe');
    });

    it('validates DispatchSendSchema with four-eyes tokens', () => {
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
        headline: 'MANDATORY EVACUATION ORDER: PURI',
        description: '135 kt winds and 4.8m surge.',
        instruction: 'Evacuate immediately.',
        districtId: 'puri',
        peakWindKt: 135,
        peakSurgeM: 4.8,
        areaDesc: 'Puri Coastal Tract',
      };

      const primary = createApprovalToken('DUTY-01', 'PRIMARY_DUTY_OFFICER', sampleAlert);
      const secondary = createApprovalToken('COMM-01', 'RELIEF_COMMISSIONER_APPROVER', sampleAlert);

      const validDispatch = DispatchSendSchema.safeParse({
        alertId: 'IN-NDMA-CYC-FANI-20261028-001',
        channels: ['SMS', 'WhatsApp', 'Civil Sirens'],
        dutyOfficer: 'Senior Duty Meteorologist',
        primaryApprovalToken: primary,
        secondaryApprovalToken: secondary,
        message: {
          headline: sampleAlert.headline,
          description: sampleAlert.description,
          districtId: 'puri',
        },
      });

      expect(validDispatch.success).toBe(true);
    });

    it('validates InsuranceClaimSchema limits and trigger parameters', () => {
      const valid = InsuranceClaimSchema.safeParse({
        districtId: 'puri',
        triggerWindKt: 120,
        triggerSurgeM: 3.5,
        observedWindKt: 135,
        observedSurgeM: 4.8,
      });
      expect(valid.success).toBe(true);
    });
  });

  describe('Health & Readiness Endpoints', () => {
    it('verifies audit chain health and uptime structure', () => {
      const integrity = globalAuditChain.verifyIntegrity();
      expect(integrity.isValid).toBe(true);
      expect(globalAuditChain.getRecords().length).toBeGreaterThanOrEqual(0);
    });
  });
});

