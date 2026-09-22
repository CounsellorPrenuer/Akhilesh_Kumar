/**
 * SANITY SCHEMA: Global SEO Settings
 * 
 * Global SEO metadata for the website (Open Graph, meta tags, etc.)
 */

export default {
  name: 'seoSettings',
  title: 'SEO Settings',
  type: 'document',
  
  fields: [
    {
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      description: 'Your website name for SEO',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      description: 'Global meta description for search engines (50-160 characters)',
      validation: (Rule) => Rule.required().max(160)
    },
    {
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: 'Image shown when sharing on social media (1200x630px recommended)',
      options: {
        hotspot: true,
      }
    },
    {
      name: 'faviconUrl',
      title: 'Favicon URL',
      type: 'url',
      description: 'URL to your favicon (e.g., /favicon.ico or /logo.png)'
    },
    {
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Main keywords for your website (comma-separated)'
    },
    {
      name: 'author',
      title: 'Author Name',
      type: 'string',
      description: 'Author for meta tag'
    }
  ]
}
