import { describe, it, expect } from 'vitest';
import { authMiddleware, requireRoles, requireDistrictAccess } from '../../src/security/authMiddleware';

describe('Auth, RBAC & ABAC Jurisdiction Middleware', () => {
  it('sets default duty officer session when no auth header is present', () => {
    const req: any = { headers: {} };
    const res: any = {};
    let nextCalled = false;
    authMiddleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.user.id).toBe('NDMA-OPS-04');
    expect(req.user.role).toBe('DUTY_OFFICER');
  });

  it('authenticates admin token correctly', () => {
    const req: any = { headers: { authorization: 'Bearer admin-token' } };
    const res: any = {};
    let nextCalled = false;
    authMiddleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.user.role).toBe('ADMIN');
    expect(req.user.districtScope).toEqual(['*']);
  });

  it('authenticates commissioner token correctly', () => {
    const req: any = { headers: { authorization: 'Bearer commissioner-token' } };
    const res: any = {};
    let nextCalled = false;
    authMiddleware(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect(req.user.role).toBe('RELIEF_COMMISSIONER');
  });

  it('enforces RBAC role restrictions', () => {
    const guard = requireRoles('ADMIN');
    const req: any = { user: { role: 'DUTY_OFFICER' } };
    let statusSent = 0;
    let jsonSent: any = null;
    const res: any = {
      status: (code: number) => {
        statusSent = code;
        return {
          json: (data: any) => {
            jsonSent = data;
          },
        };
      },
    };

    guard(req, res, () => {});
    expect(statusSent).toBe(403);
    expect(jsonSent.error).toContain('Forbidden');
  });

  it('enforces ABAC district jurisdictional scoping', () => {
    const guard = requireDistrictAccess((r: any) => r.district);
    const reqAuthorized: any = {
      user: { id: 'OFFICER-01', districtScope: ['puri'] },
      district: 'puri',
    };
    let nextCalled = false;
    guard(reqAuthorized, {} as any, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);

    const reqUnauthorized: any = {
      user: { id: 'OFFICER-01', districtScope: ['puri'] },
      district: 'kolkata',
    };
    let statusSent = 0;
    const res: any = {
      status: (code: number) => {
        statusSent = code;
        return { json: () => {} };
      },
    };
    guard(reqUnauthorized, res, () => {});
    expect(statusSent).toBe(403);
  });
});
