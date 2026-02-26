import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'photo',
  title: 'Photo',
  type: 'document',

  fields: [
    // BASIC INFO
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(120),
    }),

    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
        isUnique: (slug, context) => context.defaultIsUnique(slug, context),
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),

    // CATEGORY
    defineField({
      name: 'category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (Rule) => Rule.required(),
    }),

    // TAGS
    defineField({
      name: 'tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
    }),

    // FEATURED
    defineField({
      name: 'featured',
      type: 'boolean',
      initialValue: false,
    }),

    // 💰 PAID SYSTEM
    defineField({
      name: 'isPaid',
      title: 'Paid Photo',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'price',
      title: 'Price ₹',
      type: 'number',
      hidden: ({document}) => !document?.isPaid,
      validation: (Rule) =>
        Rule.custom((price, context) => {
          if (context.document?.isPaid && (!price || price <= 0)) {
            return 'Enter valid price for paid photo'
          }
          return true
        }),
    }),

    defineField({
      name: 'downloadFile',
      title: 'Original File',
      type: 'file',
      hidden: ({document}) => !document?.isPaid,
    }),

    // 📷 EXIF DATA
    defineField({
      name: 'exif',
      title: 'Camera Details',
      type: 'object',
      fields: [
        {name: 'camera', type: 'string'},
        {name: 'lens', type: 'string'},
        {name: 'focalLength', type: 'string'},
        {name: 'aperture', type: 'string'},
        {name: 'shutterSpeed', type: 'string'},
        {name: 'iso', type: 'number'},
        {name: 'takenAt', type: 'datetime'},
      ],
    }),

    // WATERMARK TOGGLE
    defineField({
      name: 'enabled',
      title: 'Enable Watermark',
      type: 'boolean',
      initialValue: true,
    }),

    defineField({
      name: 'publishedAt',
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
      media: 'image',
      price: 'price',
      paid: 'isPaid',
    },
    prepare({title, media, price, paid}) {
      return {
        title,
        media,
        subtitle: paid ? `Paid • ₹${price}` : 'Free Photo',
      }
    },
  },
})
