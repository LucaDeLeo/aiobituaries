import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Performance optimization: Enable package import optimization for tree-shaking (AC-6.8.7)
  experimental: {
    optimizePackageImports: [
      '@visx/axis',
      '@visx/scale',
      '@visx/grid',
      '@visx/group',
      '@visx/responsive',
      'lucide-react',
      'date-fns'
    ]
  },

  // Image optimization configuration (AC-6.8.8)
  images: {
    // Serve modern formats (AVIF preferred, fallback to WebP)
    formats: ['image/avif', 'image/webp'],
    // Responsive image sizes for different device breakpoints
    deviceSizes: [320, 640, 768, 1024, 1280, 1920],
    // Cache images for 1 year (31536000 seconds)
    minimumCacheTTL: 31536000
  },

  // Security and cache headers
  async headers() {
    // Security headers applied to all routes
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()'
      },
      {
        // Content Security Policy - adjust as needed for your specific requirements
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Next.js
          "style-src 'self' 'unsafe-inline'", // Required for styled-jsx and CSS-in-JS
          "img-src 'self' data: https: blob:",
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://api.exa.ai",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; ')
      }
    ];

    return [
      // Apply security headers to all routes
      {
        source: '/(.*)',
        headers: securityHeaders
      },
      // Cache images with immutable headers for maximum performance
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      // Cache Next.js static files (JS, CSS) with immutable headers
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
