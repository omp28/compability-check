module.exports = {
  siteUrl: "https://who-knows-better.fun",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: "daily",
  priority: 0.7,
  exclude: ["/api/*"],
  robotsTxtOptions: {
    additionalSitemaps: ["https://who-knows-better.fun/sitemap.xml"],
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/*"],
      },
    ],
  },
};
