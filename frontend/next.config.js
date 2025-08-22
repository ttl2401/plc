/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

// CSP an toàn-vừa-đủ cho ZXing / BarcodeDetector polyfill chạy trong Worker + WASM
const csp = [
  "default-src 'self'",
  // WASM + (tuỳ chọn) eval cho dev/iOS cũ
  `script-src 'self' ${isDev ? "'unsafe-eval' " : ""}'wasm-unsafe-eval'`,
  // nếu bạn có inline style (thường Tailwind JIT), cần 'unsafe-inline'
  "style-src 'self' 'unsafe-inline'",
  // Cho Web Worker/Blob (nhiều scanner spawn worker bằng blob:)
  "worker-src 'self' blob:",
  // Safari cũ chưa hiểu worker-src => dự phòng
  "child-src 'self' blob:",
  // Cho video/ảnh/QR preview từ blob/data
  "img-src 'self' blob: data:",
  "media-src 'self' blob:",
  // Hạn kết nối chỉ về cùng origin; nếu gọi API domain khác, thêm domain vào đây
  "connect-src 'self'",
  // Khoá object tag
  "object-src 'none'",
  // Tuỳ chọn: ngăn bị embed trong iframe trái phép
  "frame-ancestors 'self'"
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    // Disable webpack cache
    config.cache = false;
    return config;
  },

  // Disable Next.js on-demand entries cache (giữ nguyên theo cấu hình của bạn)
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  },

  // Thêm CSP headers cho mọi route
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          // Nếu bạn cần dùng WASM multi-thread/OffscreenCanvas, bỏ comment 2 dòng dưới
          // { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          // { key: 'Cross-Origin-Opener-Policy',  value: 'same-origin' },
          // Một số header bảo mật hữu ích khác (tuỳ chọn):
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=()' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
