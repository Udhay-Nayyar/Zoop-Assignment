const apiUrl = (process.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rewrites are evaluated at build time; changing VITE_API_URL requires a redeploy.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`
      },
      {
        source: "/health",
        destination: `${apiUrl}/health`
      }
    ];
  }
};

module.exports = nextConfig;
