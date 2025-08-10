// export default {
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*',
//         destination: 'http://localhost:5001/api/:path*',
//       },
//     ];
//   },
// }; 


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'i.pinimg.com',
      'img.freepik.com',
      'via.placeholder.com',
      'res.cloudinary.com',
      'platform-lookaside.fbsbx.com',
      'graph.facebook.com',
      'dgzcfva4b.cloudinary.net'
    ],
  },
  compiler: {
    styledComponents: true,
  },
  experimental: {
    optimizeCss: true,
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:5001/api/:path*',
        },
      ];
    }
    return [];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.css$/i,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader'
      ],
    });
    return config;
  },
};

export default nextConfig;