/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,

  output: 'export',

  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      }
    ]
  }

  // redirects: async () => {
  //   return [
  //     {
  //       source: '/',
  //       destination: '/login',
  //       permanent: true,
  //       locale: false
  //     }
  //   ]
  // }
}

export default nextConfig
