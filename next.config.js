const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	allowedDevOrigins: ["172.31.103.7", "127.0.0.1"],
	sassOptions: {
		includePaths: [path.join(__dirname, "src")],
	},

	turbopack: {
		rules: {
			"*.svg": {
				loaders: ["@svgr/webpack"],
				as: "*.js",
			},
		},
	},

	env: {
		PROJECT_PREFIX: "United Parts",
		API_URL: process.env.API_URL || "http://172.31.103.7:8008/api/v1",
		IMAGE_BASE_URL: process.env.IMAGE_BASE_URL || "http://172.31.103.7:8008",
	},

	images: {
		remotePatterns: [{ protocol: "http", hostname: "localhost", port: "8008" }],
	},
};

module.exports = nextConfig;
