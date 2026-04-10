import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'retouch',
  title: 'Retouch (Before/After)',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(120),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        isUnique: (slug, context) => context.defaultIsUnique(slug, context),
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'beforeImage',
      title: 'Before Image (Original)',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['exif', 'location', 'lqip', 'palette'],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'afterImage',
      title: 'After Image (Edited)',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['lqip'],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],

  orderings: [
    {
      title: 'Newest',
      name: 'newest',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],

  preview: {
    select: {
      title: 'title',
      media: 'afterImage',
      mediaFallback: 'beforeImage',
    },
    prepare({title, media, mediaFallback}) {
      return {
        title,
        media: media || mediaFallback,
        subtitle: 'Before & After Retouch',
      }
    },
  },
})
