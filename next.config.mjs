/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['cdn.sanity.io'],

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
