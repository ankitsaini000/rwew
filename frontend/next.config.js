// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     domains: [
//       'localhost', 
//       'images.unsplash.com', 
//       'i.pinimg.com', 
//       'img.freepik.com', 
//       'via.placeholder.com', 
//       'cloudinary.com', 
//       'res.cloudinary.com',
//       'platform-lookaside.fbsbx.com', // Facebook profile images
//       'graph.facebook.com',           // Alternative Facebook image domain
//       'dgzcfva4b.cloudinary.net'     // Your specific Cloudinary cloud name
//     ],
//   },
//   // Add configuration to ignore Grammarly attributes
//   compiler: {
//     styledComponents: true,
//     // Ignore Grammarly browser extension attributes that cause warnings
//     ignoreDuringBuilds: true,
//   },
//   // Configure which HTML attributes to accept
//   experimental: {
//     // This will ignore data-* attributes from causing warnings
//     largePageDataBytes: 128 * 1000, // default is 128KB
//   },
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*',
//         destination: 'http://localhost:5000/api/:path*',
//       },
//     ];
//   },
//   webpack: (config) => {
//     config.experiments = {
//       ...config.experiments,
//       topLevelAwait: true,
//     }
//     return config
//   },
// };

// module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable output file tracing for better deployment
  output: 'standalone',
  // Configure images
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'i.pinimg.com',
      'img.freepik.com',
      'via.placeholder.com',
      'cloudinary.com',
      'res.cloudinary.com',
      'platform-lookaside.fbsbx.com',
      'graph.facebook.com',
      'dgzcfva4b.cloudinary.net'
    ],
  },
  // Compiler configuration
  compiler: {
    styledComponents: true,
  },
  // Experimental features
  experimental: {
    largePageDataBytes: 256 * 1000, // Increased from 128KB to 256KB
    // Enable server actions
    serverActions: true,
    // Enable new next link behavior
    newNextLinkBehavior: true,
    // Improve build performance
    optimizeCss: true,
    // Improve build performance
    optimizePackageImports: [
      'react-icons',
      'lucide-react',
      '@heroicons/react',
      'date-fns'
    ],
  },
  // API rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL ? 
          `${process.env.NEXT_PUBLIC_API_URL}/:path*` : 
          'http://localhost:5000/api/:path*',
      },
    ];
  },
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Enable top-level await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    // Fix for client reference manifest in production
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        tls: false,
        net: false,
        dns: false,
        child_process: false,
      };
    }

    return config;
  },
  // Disable static optimization for problematic pages
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    serverActions: true,
  },
  // Configure page data cache
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
