import { z } from 'zod';

export const ChatRequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  context: z
    .object({
      cycloneName: z.string().max(100).optional(),
      districtName: z.string().max(100).optional(),
      currentWindKt: z.number().min(0).max(350).optional(),
      currentPressureHpa: z.number().min(850).max(1050).optional(),
      surgePeakM: z.number().min(0).max(25).optional(),
    })
    .optional(),
});

export const AdvisoryRequestSchema = z.object({
  districtName: z.string().min(1).max(100).default('Puri'),
  leadTimeHours: z.number().int().min(0).max(120).default(18),
  severity: z.enum(['Moderate', 'Severe', 'Extreme']).default('Severe'),
  languages: z.array(z.string()).optional(),
});

export const DispatchSendSchema = z.object({
  alertId: z.string().min(1).max(100),
  channels: z.array(z.string()).min(1).default(['SMS', 'WhatsApp', 'Civil Sirens']),
  dutyOfficer: z.string().min(1).max(150).default('Duty Meteorologist (ID: NDMA-OPS-04)'),
  authorizingOfficer: z.string().max(150).optional(),
  primaryApprovalToken: z
    .object({
      officerId: z.string(),
      role: z.enum(['PRIMARY_DUTY_OFFICER', 'RELIEF_COMMISSIONER_APPROVER']),
      timestamp: z.string(),
      contentHash: z.string(),
      signature: z.string(),
    })
    .optional(),
  secondaryApprovalToken: z
    .object({
      officerId: z.string(),
      role: z.enum(['PRIMARY_DUTY_OFFICER', 'RELIEF_COMMISSIONER_APPROVER']),
      timestamp: z.string(),
      contentHash: z.string(),
      signature: z.string(),
    })
    .optional(),
  message: z
    .object({
      headline: z.string().max(300),
      description: z.string().max(3000).optional(),
      instruction: z.string().max(1000).optional(),
      districtId: z.string().max(50).optional(),
      peakWindKt: z.number().optional(),
      peakSurgeM: z.number().optional(),
    })
    .optional(),
});

export const InsuranceClaimSchema = z.object({
  districtId: z.string().min(1).max(50),
  triggerWindKt: z.number().min(30).max(300),
  triggerSurgeM: z.number().min(0.5).max(20),
  observedWindKt: z.number().min(0).max(350),
  observedSurgeM: z.number().min(0).max(25),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type AdvisoryRequest = z.infer<typeof AdvisoryRequestSchema>;
export type DispatchSendRequest = z.infer<typeof DispatchSendSchema>;
export type InsuranceClaimRequest = z.infer<typeof InsuranceClaimSchema>;
