/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push(
        'mongoose',
        'next-auth-mongoose-adapter', // Externalize the adapter itself
        // Externalize optional dependencies of the MongoDB driver
        'bson-ext',
        'kerberos',
        '@mongodb-js/zstd',
        'snappy',
        'aws4',
        'mongodb-client-encryption'
      );
    }
    return config;
  },
};

module.exports = nextConfig;
