import { Config }  from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // mirror tsconfig paths
  },
  transformIgnorePatterns: [
    "node_modules/(?!(pocketbase)/)", // still needed for pocketbase ESM
  ],
};

export default config;