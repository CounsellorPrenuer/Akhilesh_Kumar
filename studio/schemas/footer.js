/**
 * SANITY SCHEMA: Footer
 * 
 * Footer copyright text and social media links.
 */

export default {
  name: 'footer',
  title: 'Footer',
  type: 'document',
  
  fields: [
    {
      name: 'copyright',
      title: 'Copyright Text',
      type: 'string',
      description: 'Copyright notice (e.g., "© 2024 Company Name. All rights reserved.")',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'array',
      description: 'Links to your social media profiles',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              title: 'Platform Name',
              type: 'string',
              description: 'e.g., "LinkedIn", "Twitter", "GitHub"',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] })
            }
          ],
          preview: {
            select: {
              label: 'label',
              url: 'url'
            },
            prepare(selection) {
              return {
                title: selection.label,
                subtitle: selection.url
              }
            }
          }
        }
      ]
    }
  ],
  preview: {
    select: {
      copyright: 'copyright'
    },
    prepare(selection) {
      return {
        title: 'Footer',
        subtitle: selection.copyright
      }
    }
  }
}
