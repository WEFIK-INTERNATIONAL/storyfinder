import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'story',
  title: 'Featured Story',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(120),
    }),

    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'organization',
      title: 'Featured At (Newspaper / Website Name)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'link',
      title: 'Feature Post Link',
      type: 'url',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),

    defineField({
      name: 'featuredPhoto',
      title: 'Featured Photo',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'organizationLogo',
      title: 'Organization Logo',
      type: 'image',
      options: {hotspot: true},
    }),

    defineField({
      name: 'featuredDate',
      title: 'Featured Date',
      type: 'date',
    }),
  ],

  orderings: [
    {
      title: 'Newest',
      name: 'newest',
      by: [{field: 'featuredDate', direction: 'desc'}],
    },
  ],

  preview: {
    select: {
      title: 'title',
      subtitle: 'organization',
      media: 'featuredPhoto',
    },
  },
})
