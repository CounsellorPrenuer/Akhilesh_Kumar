/**
 * SANITY SCHEMA: Contact Section
 * 
 * Contact information and form configuration.
 */

export default {
  name: 'contact',
  title: 'Contact Section',
  type: 'document',
  
  fields: [
    {
      name: 'title',
      title: 'Section Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      initialValue: 'Get In Touch'
    },
    {
      name: 'description',
      title: 'Section Description',
      type: 'text',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'formFields',
      title: 'Form Fields',
      type: 'array',
      description: 'Configure which fields appear in the contact form',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Field Name',
              type: 'string',
              description: 'Form field name (e.g., "fullName", "email")',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'type',
              title: 'Field Type',
              type: 'string',
              options: {
                list: ['text', 'email', 'tel', 'textarea']
              },
              validation: (Rule) => Rule.required()
            },
            {
              name: 'placeholder',
              title: 'Placeholder Text',
              type: 'string',
              validation: (Rule) => Rule.required()
            },
            {
              name: 'required',
              title: 'Required',
              type: 'boolean',
              initialValue: true
            }
          ],
          preview: {
            select: {
              name: 'name',
              type: 'type'
            },
            prepare(selection) {
              return {
                title: selection.name,
                subtitle: selection.type
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
      title: 'title'
    },
    prepare(selection) {
      return {
        title: selection.title
      }
    }
  }
}
