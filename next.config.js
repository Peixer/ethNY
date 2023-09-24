/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "",
  images: {
    domains: ["localhost", "storage.googleapis.com"],
  },
};

module.exports = nextConfig;
