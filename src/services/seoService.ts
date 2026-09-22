export interface SeoConfig {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article';
  schema?: Record<string, unknown> | Record<string, unknown>[];
}

export function updatePageSeo(config: SeoConfig) {
  // Update Title
  const brandTitle = config.title.includes('NEXORA') ? config.title : `${config.title} | NEXORA LOGISTICS`;
  document.title = brandTitle;

  // Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', config.description);

  // OpenGraph tags
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', brandTitle);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', config.description);

  if (config.image) {
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', config.image);
  }

  // Canonical tag
  let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  const currentUrl = window.location.origin + window.location.pathname;
  linkCanonical.setAttribute('href', config.canonical || currentUrl);

  // Inject Structured Data Schema if present
  const existingSchema = document.getElementById('nexora-dynamic-schema');
  if (existingSchema) {
    existingSchema.remove();
  }

  if (config.schema) {
    const script = document.createElement('script');
    script.id = 'nexora-dynamic-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(config.schema);
    document.head.appendChild(script);
  }
}
