export const prerender = false; // Importante: fuerza a que se ejecute en el servidor

export async function GET() {
  const API_KEY = import.meta.env.PUBLIC_YOUTUBE_API_KEY;
  const CHANNEL_ID = 'UCI9sYIUG13W13rBGSPI_yBQ';

  try {
    if (!API_KEY) {
      return new Response(JSON.stringify({ error: "Falta API_KEY en servidor" }), { status: 500 });
    }

    const uploadsPlaylistId = CHANNEL_ID.replace('UC', 'UU');
    
    // Obtener los últimos 3 videos (Ahorra cuota pidiendo solo lo necesario)
    const vRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3&key=${API_KEY}`,
      { headers: { 'Referer': 'https://iglesia-mca.pages.dev/' } }
    );

    if (!vRes.ok) {
      const errText = await vRes.text();
      throw new Error(`Google Error: ${vRes.status} - ${errText}`);
    }

    const vData = await vRes.json();
    const videos = vData.items.map(item => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.high?.url || '',
      link: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
    }));

    // Verificar si el video más reciente está en vivo
    let isLive = false;
    if (videos[0]?.id) {
      const statusRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videos[0].id}&key=${API_KEY}`,
        { headers: { 'Referer': 'https://iglesia-mca.pages.dev/' } }
      );
      const statusData = await statusRes.json();
      isLive = statusData.items?.[0]?.snippet?.liveBroadcastContent === 'live';
    }

    return new Response(JSON.stringify({ videos, isLive }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // Cache de 15 minutos en Cloudflare para que no se agote tu cuota diaria
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=600"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}