/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 환경에서는 export 모드 비활성화
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export', // ✅ 정적 HTML export 모드 (프로덕션만)
    basePath: '/MedilinkPlus', // ✅ 저장소 이름과 동일해야 함
    assetPrefix: '/MedilinkPlus/',
  }),
  images: { unoptimized: true }, // 이미지 최적화 비활성화 (필수)
};

module.exports = nextConfig;
