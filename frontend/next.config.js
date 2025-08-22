/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

// ====== TÙY CHỈNH: các origin API ngoài 'self' mà FE được phép kết nối ======
const ALLOWED_CONNECT_ORIGINS = [
  "'self'",
  // Thêm các origin bạn cần gọi ra ngoài tại đây:
  process.env.NEXT_PUBLIC_API_URL,
  // "http://192.168.1.10:3010", // nếu có gọi HTTP, giữ dòng này; nếu không, có thể xóa
  // Ví dụ: "https://api.example.com"
];
// Cách nhanh: cho phép mọi ảnh HTTPS bằng "https:". Nếu cần cả HTTP, thêm "http:".
const ALLOWED_IMG_SRC = [
  "'self'",
  "blob:",
  "data:",
  "https:",   // cho phép mọi ảnh HTTPS (CDN, avatar, S3, v.v.)
  // "http:",  // chỉ bật nếu bạn thực sự cần load ảnh HTTP
  // Hoặc liệt kê cụ thể: "https://cdn.jsdelivr.net", "https://images.example.com", ...
];

// (tuỳ) nếu bạn phát video/audio/stream ngoài origin, cấu hình tương tự:
const ALLOWED_MEDIA_SRC = [
  "'self'",
  "blob:",
  "data:",
  "https:",
  // "http:",
];

const csp = [
  "default-src 'self'",
  // Cho phép inline script (Next cần), và eval chỉ ở dev
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}'wasm-unsafe-eval'`,
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  // Áp dụng whitelist ảnh & media
  `img-src ${ALLOWED_IMG_SRC.join(' ')}`,
  `media-src ${ALLOWED_MEDIA_SRC.join(' ')}`,
  // Kết nối (fetch/XHR/WebSocket…)
  `connect-src ${ALLOWED_CONNECT_ORIGINS.join(' ')}`,
  "object-src 'none'",
  "frame-ancestors 'self'",
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

  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
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