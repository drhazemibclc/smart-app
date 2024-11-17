export default {
  env: {
    POSTGRES_URL: process.env.POSTGRES_URL || 'postgresql://postgres:example@localhost:5432/clinicdb',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com'
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com'
      }
    ]
  }
};
