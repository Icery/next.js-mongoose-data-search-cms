/** @type {import('next').NextConfig} */
const baseUrl = process.env.API_ORIGIN;
const baseUrlDev = `http://localhost:${process.env.PORT || 3000}`;
const usedUrl = process.env.NODE_ENV === 'production' ? baseUrl : baseUrlDev

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mtmptech.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
    env: {
        NEXT_PRIVATE_MONGODB_URI: process.env.MONGODB_URI,
        NEXT_PRIVATE_JWT_SECRET: process.env.JWT_SECRET,
        NEXT_PRIVATE_EMAIL_USER: process.env.EMAIL_USER,
        NEXT_PRIVATE_EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
        NEXT_PRIVATE_ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        NEXT_PRIVATE_GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,

        NEXT_PUBLIC_BASE_URL: usedUrl,
        NEXT_PUBLIC_API_BASE_URL: `${usedUrl}/api`,
        NEXT_PUBLIC_SITE_NAME: "MtM+ Technology",
        NEXT_PUBLIC_FEATURED_IMAGE: "https://mtmptech.com/wp-content/uploads/2022/07/logo_1280x720.jpg",
    }
};

export default nextConfig;
