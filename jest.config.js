const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
	moduleDirectories: ["node_modules", "<rootDir>/src"],
	// Icons import this ESM subpath even from their CommonJS build.
	moduleNameMapper: { "^@ant-design/colors/es/(.*)$": "@ant-design/colors/lib/$1" },
	setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
	testEnvironment: "jest-environment-jsdom",
	testPathIgnorePatterns: ["/node_modules/", "/.next/"],
};

module.exports = createJestConfig(customJestConfig);
