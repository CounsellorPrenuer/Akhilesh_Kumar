/**
 * SANITY SCHEMA: Site Configuration
 * 
 * This schema defines global site settings that can be edited in Sanity Studio.
 * It's a singleton document - only one instance exists.
 */

export default {
  name: 'site',
  title: 'Site Configuration',
  type: 'document',
  // This makes it a singleton - only one document of this type can exist
  __experimental_actions: ['create', 'update', /*'delete'*/],
  
  fields: [
    {
      name: 'title',
      title: 'Website Title',
      type: 'string',
      description: 'Main website title (used in browser tab)',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'description',
      title: 'Website Description',
      type: 'text',
      description: 'SEO description for search engines',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'logo',
      title: 'Logo Text',
      type: 'string',
      description: 'Short text/acronym for navbar logo (e.g., "PS", "ACME")',
      validation: (Rule) => Rule.required().max(5)
    },
    {
      name: 'primaryColor',
      title: 'Primary Color',
      type: 'string',
      description: 'Primary brand color (hex code)',
      validation: (Rule) => Rule.required().regex(/^#[0-9A-F]{6}$/i)
    },
    {
      name: 'secondaryColor',
      title: 'Secondary Color',
      type: 'string',
      description: 'Secondary brand color (hex code)',
      validation: (Rule) => Rule.required().regex(/^#[0-9A-F]{6}$/i)
    },
    {
      name: 'email',
      title: 'Contact Email',
      type: 'string',
      validation: (Rule) => Rule.required().email()
    },
    {
      name: 'phone',
      title: 'Contact Phone',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'address',
      title: 'Address',
      type: 'string',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'theme',
      title: 'Theme Settings',
      type: 'object',
      description: 'Global theme and styling options',
      fields: [
        {
          name: 'fontFamily',
          title: 'Font Family',
          type: 'string',
          options: {
            list: [
              { title: 'System Default', value: 'system' },
              { title: 'Inter (Modern)', value: 'inter' },
              { title: 'Georgia (Classic)', value: 'georgia' },
              { title: 'Courier (Monospace)', value: 'courier' }
            ]
          },
          initialValue: 'system'
        },
        {
          name: 'accentColor',
          title: 'Accent Color',
          type: 'string',
          description: 'Accent color for highlights (hex code)',
          validation: (Rule) => Rule.regex(/^#[0-9A-F]{6}$/i)
        },
        {
          name: 'darkMode',
          title: 'Enable Dark Mode',
          type: 'boolean',
          initialValue: false
        }
      ]
    },
    {
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      description: 'Links to your social media profiles',
      fields: [
        {
          name: 'instagram',
          title: 'Instagram URL',
          type: 'url',
          description: 'https://instagram.com/yourprofile'
        },
        {
          name: 'linkedin',
          title: 'LinkedIn URL',
          type: 'url',
          description: 'https://linkedin.com/company/yourcompany'
        },
        {
          name: 'twitter',
          title: 'Twitter / X URL',
          type: 'url',
          description: 'https://twitter.com/yourprofile'
        },
        {
          name: 'facebook',
          title: 'Facebook URL',
          type: 'url',
          description: 'https://facebook.com/yourpage'
        },
        {
          name: 'github',
          title: 'GitHub URL',
          type: 'url',
          description: 'https://github.com/yourprofile'
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare(selection) {
      return {
        title: selection.title || 'Site Configuration'
      }
    }
  }
}
