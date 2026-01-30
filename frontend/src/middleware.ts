import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // Danh sách ngôn ngữ
    locales: ['vi', 'en', 'ja'],

    // Ngôn ngữ mặc định nếu không khớp
    defaultLocale: 'vi'
});

export const config = {
    // Matcher để bỏ qua các file api, ảnh, icon...
    matcher: ['/', '/(vi|en|ja)/:path*']
};