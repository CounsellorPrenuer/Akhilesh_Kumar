/**
 * SANITY SCHEMA: Service (Card Item)
 * 
 * Represents a single service/event/career that appears in the cards section.
 * Services can be created, edited, and deleted independently.
 */

export default {
  name: 'service',
  title: 'Service / Card',
  type: 'document',
  
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Service name (e.g., "Strategic Consulting")',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule) => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Service description (2-3 sentences)',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'icon',
      title: 'Icon (emoji)',
      type: 'string',
      description: 'Emoji icon for the service card',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'color',
      title: 'Accent Color',
      type: 'string',
      description: 'Hex color for card accent (e.g., #667eea)',
      validation: (Rule) => Rule.regex(/^#[0-9A-F]{6}$/i),
      initialValue: '#667eea'
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order in which services appear (0, 1, 2, ...)',
      initialValue: 0
    }
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }]
    }
  ],
  preview: {
    select: {
      title: 'title',
      icon: 'icon'
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: selection.icon
      }
    }
  }
}
