import {defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons'

export default defineType({
  name: 'cartelera',
  title: 'Cartelera Iglesia',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'titulo',
      title: 'Nombre del Anuncio',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'imagen',
      title: 'Imagen del Cartel',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'publicado',
      title: '¿Activo?',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})