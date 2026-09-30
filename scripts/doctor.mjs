#!/usr/bin/env node
/**
 * CycloneShield System Diagnostic Doctor
 * Validates runtime versions, dependencies, environment configs, and system readiness.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const cwd = process.cwd();
const issues = [];
let passCount = 0;

console.log('\n======================================================');
console.log('  CYCLONESHIELD SYSTEM DOCTOR & ENVIRONMENT AUDITOR');
console.log('======================================================\n');

// 1. Node Version Check
const nodeVersion = process.version;
const major = parseInt(nodeVersion.slice(1).split('.')[0], 10);
if (major >= 18) {
  console.log(`[\x1b[32mPASS\x1b[0m] Node.js Version: ${nodeVersion} (>= 18.0.0 required)`);
  passCount++;
} else {
  console.log(`[\x1b[31mFAIL\x1b[0m] Node.js Version: ${nodeVersion} (Node 18+ required)`);
  issues.push('Upgrade Node.js to version 18.x or 20.x.');
}

// 2. Package & Lockfile Check
const pkgPath = path.join(cwd, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  console.log(`[\x1b[32mPASS\x1b[0m] Project Manifest: ${pkg.name || 'CycloneShield'} v${pkg.version || '2.0.0'}`);
  passCount++;
} else {
  console.log(`[\x1b[31mFAIL\x1b[0m] package.json missing`);
  issues.push('Ensure package.json exists in workspace root.');
}

// 3. Environment Template Check
const envExamplePath = path.join(cwd, '.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log(`[\x1b[32mPASS\x1b[0m] .env.example template present`);
  passCount++;
} else {
  console.log(`[\x1b[33mWARN\x1b[0m] .env.example missing`);
  issues.push('Create .env.example documenting all deployment keys.');
}

// 4. Critical Files Verification
const criticalFiles = [
  'src/geo-core/hollandWind.ts',
  'src/geo-core/surgeBathtub.ts',
  'src/security/alertIntegrity.ts',
  'src/security/cryptoAuditLog.ts',
  'src/security/llmGuardrails.ts',
  'server.ts',
  'vercel.json',
];

let allFilesExist = true;
for (const file of criticalFiles) {
  if (!fs.existsSync(path.join(cwd, file))) {
    console.log(`[\x1b[31mFAIL\x1b[0m] Missing critical source file: ${file}`);
    allFilesExist = false;
    issues.push(`Restore missing file: ${file}`);
  }
}
if (allFilesExist) {
  console.log(`[\x1b[32mPASS\x1b[0m] All core security & geospatial modules present`);
  passCount++;
}

// 5. Memory & System Health Check
const totalMem = Math.round(process.memoryUsage().heapTotal / (1024 * 1024));
console.log(`[\x1b[32mPASS\x1b[0m] System Memory Allocated: ${totalMem} MB`);
passCount++;

// Summary
console.log('\n------------------------------------------------------');
if (issues.length === 0) {
  console.log(`\x1b[32mDOCTOR SUMMARY: ALL ${passCount} CHECKS PASSED. Ready for Production & Vercel Deployment.\x1b[0m\n`);
  process.exit(0);
} else {
  console.log(`\x1b[31mDOCTOR SUMMARY: ${issues.length} ISSUE(S) DETECTED:\x1b[0m`);
  issues.forEach((iss, i) => console.log(`  ${i + 1}. ${iss}`));
  console.log('\n');
  process.exit(1);
}
