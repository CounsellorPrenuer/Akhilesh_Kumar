# Sanity CMS Configuration

This folder contains the Sanity Studio configuration and content schemas for the professional website template.

## Setup Instructions

### 1. Create a Sanity Project

```bash
npm install -g @sanity/cli
sanity init
```

Follow the prompts:
- Choose "Create new project"
- Name: `professional-website-cms`
- Dataset: `production`
- Use TypeScript: Choose your preference

### 2. Configure Project ID

1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Copy your Project ID
3. Paste it in `sanity.config.js` (replace `YOUR_PROJECT_ID`)

### 3. Update Schemas

Replace the auto-generated schemas folder with the schemas provided in this project:
- `site.js` - Global site configuration
- `navbar.js` - Navigation links
- `hero.js` - Hero section
- `about.js` - About section
- `service.js` - Services/Cards (can create multiple)
- `contact.js` - Contact section
- `footer.js` - Footer

### 4. Start Sanity Studio

```bash
cd sanity
npm install
npm run dev
```

Sanity Studio will run at `http://localhost:3333`

## Creating Initial Content

In Sanity Studio, create documents for each schema type:

1. **Site Configuration** - One document with your site title, colors, contact info
2. **Navbar** - One document with navigation links
3. **Hero Section** - One document with headline and CTA
4. **About Section** - One document with description and highlights
5. **Services** - Create multiple service documents (order matters)
6. **Contact Section** - One document with form fields
7. **Footer** - One document with copyright and social links

## GROQ Queries for Frontend

The frontend uses these GROQ queries to fetch data:

```groq
// Get site configuration
*[_type == "site"][0]

// Get navbar links
*[_type == "navbar"][0].links

// Get hero section
*[_type == "hero"][0]

// Get about section
*[_type == "about"][0]

// Get all services ordered by order field
*[_type == "service"] | order(order asc)

// Get contact section
*[_type == "contact"][0]

// Get footer
*[_type == "footer"][0]
```

## API Access

To allow the frontend to fetch from Sanity:

1. Go to [sanity.io/manage](https://sanity.io/manage) → API section
2. Create a new CORS origin: `https://yourdomain.com` (and `http://localhost:8000` for local testing)
3. Create API token (read-only is sufficient)

## Environment Variables

Frontend will need:
- `SANITY_PROJECT_ID` - Your project ID
- `SANITY_DATASET` - Usually `production`
- `SANITY_API_TOKEN` - For authenticated requests (optional)

See frontend documentation for setup.
