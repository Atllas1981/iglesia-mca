import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { password } = await request.json();
    const adminPassword = (env as any).ADMIN_PASSWORD || 'admin_mca_pass_2026';

    if (password === adminPassword) {
      // Create a secure cookie setting
      const isDev = new URL(request.url).hostname === 'localhost';
      const cookieOptions = [
        `admin_session=${adminPassword}`,
        'HttpOnly',
        'Path=/',
        'Max-Age=86400', // 24 hours
        'SameSite=Lax',
        !isDev ? 'Secure' : ''
      ].filter(Boolean).join('; ');

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Set-Cookie': cookieOptions,
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Contraseña incorrecta' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
