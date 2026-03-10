/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        dangerouslyAllowSVG: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.sanity.io',
            },
        ],
        localPatterns: [
            {
                pathname: '/api/**',
            },
            {
                pathname: '/stock/**',
            },
            {
                pathname: '/images/**',
            },
            {
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
