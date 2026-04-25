import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes' // ✅ Debe apuntar a la carpeta

export default defineConfig({
  name: 'default',
  title: 'Panel Iglesia MCA',
  projectId: 'nmqh8k0r',
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})