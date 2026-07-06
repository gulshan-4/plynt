export default function sitemap() {
  const baseUrl = 'https://plynt.space';

  // These would typically be dynamically fetched from a database
  const routes = [
    '',
    '/latest',
    '/trending',
    '/categories',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
  ];

  const map = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: route === '' ? 1 : 0.8,
  }));

  return map;
}
