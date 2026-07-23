import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { isAuthorized } from '../../../lib/auth';

export const prerender = false;

interface Slide {
  id: string;
  url: string;
  alt: string;
  order: number;
  active: boolean;
}

export const GET: APIRoute = async () => {
  const KV = env.KV;

  if (!KV) {
    return new Response(JSON.stringify({ error: 'El binding de KV no está configurado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await KV.get('cartelera_slides');
    const slides = data ? JSON.parse(data) : [];
    return new Response(JSON.stringify(slides), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const KV = env.KV;
  const R2 = env.R2;

  if (!KV) {
    return new Response(JSON.stringify({ error: 'El binding de KV no está configurado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const newSlides: Slide[] = await request.json();

    // 1. Obtener la lista vieja para buscar imágenes huérfanas
    const oldData = await KV.get('cartelera_slides');
    const oldSlides: Slide[] = oldData ? JSON.parse(oldData) : [];

    // 2. Encontrar URLs de imágenes que estaban en la lista vieja pero ya no están en la nueva
    const newUrls = new Set(newSlides.map((s) => s.url));
    const orphanedUrls = oldSlides.filter((s) => !newUrls.has(s.url)).map((s) => s.url);

    // 3. Borrar las imágenes de R2 correspondientes para evitar archivos huérfanos
    if (R2) {
      for (const url of orphanedUrls) {
        const match = url.match(/\/api\/cartelera\/images\/([^/?#]+)/);
        if (match && match[1]) {
          const filename = match[1];
          try {
            await R2.delete(filename);
            console.log(`Eliminado con éxito de R2: ${filename}`);
          } catch (deleteError) {
            console.error(`Error al borrar ${filename} de R2:`, deleteError);
          }
        }
      }
    }

    // 4. Asegurarse de que el orden sea coherente numéricamente y guardarlo
    const sortedSlides = [...newSlides].sort((a, b) => a.order - b.order);
    await KV.put('cartelera_slides', JSON.stringify(sortedSlides));

    return new Response(JSON.stringify({ success: true, slides: sortedSlides }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
