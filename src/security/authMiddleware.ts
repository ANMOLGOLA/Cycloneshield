import { Request, Response, NextFunction } from 'express';

export type UserRole = 'ADMIN' | 'DUTY_OFFICER' | 'RELIEF_COMMISSIONER' | 'FIELD_RESCUER' | 'VIEWER';

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: UserRole;
  districtScope: string[]; // ['*'] for all districts, or ['puri', 'ganjam']
}

// Augment Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication middleware. Validates bearer token or sets duty officer context.
 * In development / operational exercise mode, provides simulated verified officer sessions.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token === 'admin-token') {
      req.user = {
        id: 'ADMIN-01',
        name: 'State Relief Operations Commander',
        role: 'ADMIN',
        districtScope: ['*'],
      };
      return next();
    }
    if (token === 'commissioner-token') {
      req.user = {
        id: 'COMMISSIONER-01',
        name: 'Relief Commissioner (Four-Eyes Authorizer)',
        role: 'RELIEF_COMMISSIONER',
        districtScope: ['*'],
      };
      return next();
    }
  }

  // Default operational Duty Officer context
  req.user = {
    id: 'NDMA-OPS-04',
    name: 'Senior Duty Meteorologist',
    role: 'DUTY_OFFICER',
    districtScope: ['puri', 'ganjam', 'khordha', 'jagatsinghpur', 'cuttack', 'balasore'],
  };

  next();
}

/**
 * Role-Based Access Control (RBAC) guard.
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden: Insufficient privileges for this operational endpoint',
        requiredRoles: allowedRoles,
        currentRole: req.user?.role,
      });
    }
    next();
  };
}

/**
 * Attribute-Based Access Control (ABAC) guard for district jurisdiction.
 */
export function requireDistrictAccess(getDistrictId: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction) => {
    const districtId = getDistrictId(req);
    if (!districtId || !req.user) {
      return next();
    }

    const hasAccess =
      req.user.districtScope.includes('*') ||
      req.user.districtScope.map((d) => d.toLowerCase()).includes(districtId.toLowerCase());

    if (!hasAccess) {
      return res.status(403).json({
        error: `Forbidden: Officer ${req.user.id} does not have jurisdictional authority over district "${districtId}"`,
      });
    }

    next();
  };
}
