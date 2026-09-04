export function isAuthorized(request: Request, env?: any): boolean {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/admin_session=([^;]+)/);
  if (!match) return false;
  
  const adminPassword = env?.ADMIN_PASSWORD || 'admin_mca_pass_2026';
  return match[1] === adminPassword;
}
