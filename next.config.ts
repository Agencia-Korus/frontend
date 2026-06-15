import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/dashboard/admin/:path*',
        destination: '/admin/:path*',
        permanent: false,
      },
      {
        source: '/dashboard/cliente/:path*',
        destination: '/cliente/:path*',
        permanent: false,
      },
      {
        source: '/dashboard/funcionario/:path*',
        destination: '/funcionario/:path*',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
