import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "\\.(css|scss|sass)$": "<rootDir>/src/__mocks__/styleMock.ts",
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTest.ts"],
};

export default config;
