/**
 * SANITY SCHEMA: Button / CTA
 * 
 * Reusable button component for use across sections
 */

export default {
  name: 'button',
  title: 'Button / CTA',
  type: 'object',
  
  fields: [
    {
      name: 'text',
      title: 'Button Text',
      type: 'string',
      description: 'Text displayed on the button',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'link',
      title: 'Button Link',
      type: 'string',
      description: 'URL the button links to (e.g., /, /contact, https://example.com)',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'style',
      title: 'Button Style',
      type: 'string',
      options: {
        list: [
          { title: 'Primary (Blue)', value: 'primary' },
          { title: 'Secondary (Gray)', value: 'secondary' },
          { title: 'Outline', value: 'outline' },
          { title: 'Danger (Red)', value: 'danger' }
        ]
      },
      initialValue: 'primary'
    },
    {
      name: 'openInNewTab',
      title: 'Open in New Tab',
      type: 'boolean',
      description: 'If true, link opens in a new tab',
      initialValue: false
    }
  ],
  
  preview: {
    select: {
      title: 'text',
      style: 'style'
    },
    prepare(selection) {
      const { title, style } = selection
      return {
        title,
        subtitle: style ? `Style: ${style}` : ''
      }
    }
  }
}
