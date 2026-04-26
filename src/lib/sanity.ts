import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

// Esta función asegura que obtengamos el ID sin importar dónde corra el código
const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || "nmqh8k0r";
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || "production";

export const client = createClient({
  projectId: projectId,
  dataset: dataset,
  useCdn: true, 
  apiVersion: '2024-04-25',
});

const builder = createImageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}