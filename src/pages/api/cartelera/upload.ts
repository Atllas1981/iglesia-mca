import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { isAuthorized } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const R2 = env.R2;
  if (!R2) {
    return new Response(JSON.stringify({ error: 'El binding de R2 no está configurado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return new Response(JSON.stringify({ error: 'No se subió ningún archivo' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Extraer extensión del archivo
    const lastDot = file.name.lastIndexOf('.');
    const ext = lastDot !== -1 ? file.name.substring(lastDot) : '.jpg';
    const uniqueName = `${crypto.randomUUID()}${ext}`;

    await R2.put(uniqueName, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    const fileUrl = `/api/cartelera/images/${uniqueName}`;

    return new Response(
      JSON.stringify({
        success: true,
        url: fileUrl,
        filename: uniqueName,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
