/** @type {import('next').NextConfig} */
const nextConfig = {
    agentRules: false, // don't generate AGENTS.md on dev start
    images: {
        // Next 16 blocks the image optimizer from fetching localhost/private IPs by default
        dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
            },
            {
                protocol: 'http',
                hostname: '127.0.0.1',
            },
            {
                protocol: 'http',
                hostname: 'photofinder.phigalaxy.com',
                pathname: '/**',
            },
        ],
    },
};

module.exports = nextConfig;
