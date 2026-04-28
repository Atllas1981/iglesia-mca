import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes' // ✅ Debe apuntar a la carpeta
import {myTheme} from './theme'
import {Logo} from './components/Logo'

import {deskStructure} from './deskStructure'

export default defineConfig({
  name: 'default',
  title: 'Panel Iglesia MCA',
  projectId: 'nmqh8k0r',
  dataset: 'production',
  basePath: '/admin-iglesia-mca-pages-dev',
  theme: myTheme,
  studio: {
    components: {
      logo: Logo,
    },
  },
  plugins: [structureTool({structure: deskStructure}), visionTool()],
  schema: {
    types: schemaTypes,
  },
})