/** @type {import('next').NextConfig} */
const nextConfig = {
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
