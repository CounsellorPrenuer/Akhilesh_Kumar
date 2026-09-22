import { defineType, defineField } from 'sanity'

export const testimonialsSection = defineType({
  name: 'testimonialsSection',
  title: 'Testimonials Section',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Section Heading',
      type: 'string',
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'quote',
              title: 'Quote',
              type: 'text',
            }),
            defineField({
              name: 'author',
              title: 'Author Name',
              type: 'string',
            }),
            defineField({
              name: 'role',
              title: 'Author Role/Company',
              type: 'string',
            }),
            defineField({
              name: 'avatar',
              title: 'Author Avatar',
              type: 'image',
            }),
            defineField({
              name: 'rating',
              title: 'Rating (1-5)',
              type: 'number',
              validation: (rule) => rule.min(1).max(5),
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'heading',
    },
  },
})
