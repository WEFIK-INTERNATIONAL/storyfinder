import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'photo',
  title: 'Photo',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Photo Title',
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
      name: 'description',
      title: 'Photo Description',
      type: 'text',
      rows: 3,
    }),

    // IMAGE
    defineField({
      name: 'rawImage',
      title: 'Raw Image',
      type: 'image',
      options: {
        hotspot: true,
        metadata: ['exif', 'location', 'lqip', 'palette'],
      },
      validation: (Rule) => Rule.required(),
    }),

    // TAGS
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
      validation: (Rule) => Rule.max(15),
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'category'}],
      validation: (Rule) => Rule.required(),
    }),

    // FEATURED
    defineField({
      name: 'featured',
      title: 'Featured Photo',
      type: 'boolean',
      initialValue: false,
      validation: (Rule) =>
        Rule.custom(async (featured, context) => {
          if (!featured) return true

          const {getClient, document} = context
          const client = getClient({apiVersion: '2023-01-01'})

          const count = await client.fetch(
            `count(*[_type == "photo" && featured == true && _id != $id])`,
            {id: document._id},
          )

          if (count >= 96) {
            return 'Maximum 96 featured photos allowed'
          }

          return true
        }),
    }),

    // PAID PHOTO
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
          if (context.document?.isPaid) {
            if (!price || price <= 0) {
              return 'Enter valid price for paid photo'
            }
          }
          return true
        }),
    }),

    // CAMERA DETAILS
    defineField({
      name: 'exif',
      title: 'Camera Details',
      type: 'object',
      fields: [
        {name: 'camera', title: 'Camera', type: 'string'},
        {name: 'lens', title: 'Lens', type: 'string'},
        {name: 'focalLength', title: 'Focal Length', type: 'string'},
        {name: 'aperture', title: 'Aperture', type: 'string'},
        {name: 'shutterSpeed', title: 'Shutter Speed', type: 'string'},
        {name: 'iso', title: 'ISO', type: 'number'},
        {name: 'takenAt', title: 'Taken At', type: 'datetime'},
      ],
    }),

    // DATE
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],

  orderings: [
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        {field: 'featured', direction: 'desc'},
        {field: 'publishedAt', direction: 'desc'},
      ],
    },
    {
      title: 'Newest',
      name: 'newest',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],

  preview: {
    select: {
      title: 'title',
      media: 'rawImage',
      price: 'price',
      paid: 'isPaid',
      featured: 'featured',
    },
    prepare({title, media, price, paid, featured}) {
      let status = paid ? `💰 Paid • ₹${price}` : '🆓 Free'

      if (featured) status = `⭐ Featured • ${status}`

      return {
        title,
        media,
        subtitle: status,
      }
    },
  },
})
