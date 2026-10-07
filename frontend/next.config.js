const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rewrites are evaluated at build time; changing BACKEND_URL requires a redeploy.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`
      }
    ];
  }
};

module.exports = nextConfig;
