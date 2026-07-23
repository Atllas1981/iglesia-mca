import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { filename } = params;
  if (!filename) {
    return new Response('Falta el nombre del archivo', { status: 400 });
  }

  const R2 = env.R2;

  if (!R2) {
    return new Response('El binding de R2 no está configurado', { status: 500 });
  }

  try {
    const object = await R2.get(filename);
    if (!object) {
      return new Response('Imagen no encontrada', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return new Response(`Error al obtener imagen: ${error.message}`, { status: 500 });
  }
};
