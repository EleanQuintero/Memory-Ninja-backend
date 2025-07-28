/** @type {import('jest').Config} */
export default {
    preset: 'ts-jest/presets/default-esm',
    extensionsToTreatAsEsm: ['.ts'],
    testEnvironment: 'node',

    // Paths and file matching
    roots: ['<rootDir>/src'],
    testMatch: [
        '**/__tests__/**/*.test.ts',
        '**/__tests__/**/*.spec.ts'
    ],

    // Transform configuration
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            useESM: true,
        }]
    },

    // Coverage configuration
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/index.ts',
        '!src/**/__tests__/**',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts'
    ],

    // Coverage thresholds for production readiness
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 85,
            lines: 85,
            statements: 85
        }
    },

    // Setup files
    // setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

    // Test timeout for async operations
    testTimeout: 10000,

    // Clear mocks between tests
    clearMocks: true,

    // Verbose output for debugging
    verbose: true
};
