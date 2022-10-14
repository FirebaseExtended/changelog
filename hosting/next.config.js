/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	swcMinify: true,
	images: {
		domains: [
			'cdn.raster.app',
			'fonts.gstatic.com',
			'firebasestorage.googleapis.com',
			'localhost' // storage emulator
		]
	}
}

module.exports = nextConfig
