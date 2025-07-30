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
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'i.pinimg.com',
      'img.freepik.com',
      'via.placeholder.com',
      'cloudinary.com',
      'res.cloudinary.com',
      'platform-lookaside.fbsbx.com', // Facebook profile images
      'graph.facebook.com',           // Alternative Facebook image domain
      'dgzcfva4b.cloudinary.net'     // Your specific Cloudinary cloud name
    ],
  },
  compiler: {
    styledComponents: true,
    // ❌ Remove this line — it's not valid:
    // ignoreDuringBuilds: true,
  },
  experimental: {
    largePageDataBytes: 128 * 1000, // default is 128KB
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*',
      },
    ];
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};

module.exports = nextConfig;
