/**
 * SANITY SCHEMA: Testimonial / Review
 * 
 * Customer testimonials and reviews section
 */

export default {
  name: 'testimonial',
  title: 'Testimonial / Review',
  type: 'document',
  
  fields: [
    {
      name: 'name',
      title: 'Customer Name',
      type: 'string',
      description: 'Full name of the person giving the testimonial',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'role',
      title: 'Role / Title',
      type: 'string',
      description: 'Job title or role (e.g., "CEO at Acme Corp")',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'quote',
      title: 'Testimonial Quote',
      type: 'text',
      description: 'The actual testimonial text',
      validation: (Rule) => Rule.required().min(20).max(500)
    },
    {
      name: 'image',
      title: 'Customer Photo',
      type: 'image',
      description: 'Profile photo of the customer (optional)',
      options: {
        hotspot: true,
      }
    },
    {
      name: 'rating',
      title: 'Rating',
      type: 'number',
      description: 'Star rating (1-5)',
      validation: (Rule) => Rule.min(1).max(5)
    },
    {
      name: 'company',
      title: 'Company',
      type: 'string',
      description: 'Company name (optional)'
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Order testimonials appear on the website',
      initialValue: 0
    }
  ],
  
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'image'
    }
  }
}
