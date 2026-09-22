/**
 * SANITY SCHEMA: Navigation Bar
 * 
 * Defines the navigation links shown in the navbar.
 * Uses a simple document with an array of links that can be reordered.
 */

export default {
  name: 'navbar',
  title: 'Navigation Bar',
  type: 'document',
  
  fields: [
    {
      name: 'links',
      title: 'Navigation Links',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Navigation Link',
          fields: [
            {
              name: 'label',
              title: 'Link Label',
              type: 'string',
              description: 'Text shown in navbar (e.g., "Home", "About")',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'href',
              title: 'Link Target',
              type: 'string',
              description: 'Section ID or URL (e.g., "#home", "#about", "https://example.com")',
              validation: (Rule) => Rule.required()
            }
          ],
          preview: {
            select: {
              label: 'label',
              href: 'href'
            },
            prepare(selection) {
              return {
                title: selection.label,
                subtitle: selection.href
              }
            }
          }
        }
      ],
      validation: (Rule) => Rule.required()
    }
  ],
  preview: {
    select: {
      links: 'links'
    },
    prepare(selection) {
      const count = selection.links?.length || 0
      return {
        title: 'Navigation Links',
        subtitle: `${count} links`
      }
    }
  }
}
