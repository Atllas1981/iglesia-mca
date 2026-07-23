import { env } from 'cloudflare:workers';

export function isAuthorized(request: Request): boolean {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/admin_session=([^;]+)/);
  if (!match) return false;
  
  const adminPassword = (env as any).ADMIN_PASSWORD || 'admin_mca_pass_2026';
  return match[1] === adminPassword;
}
