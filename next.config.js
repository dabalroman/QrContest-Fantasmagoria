/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites () {
        return [
            {
                source: '/collect/:code',
                destination: '/collect'
            },
            {
                source: '/collection/:cardId',
                destination: '/collection'
            },
            {
                source: '/admin/edit-card/:code',
                destination: '/admin/edit-card'
            }
        ];
    }
};

module.exports = nextConfig;
