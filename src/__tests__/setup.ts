// Global test setup file

// Increase timeout for database operations
jest.setTimeout(10000);

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
    // Mock console.log to suppress logs during tests
    console.log = jest.fn();
    // Keep console.error for debugging failed tests
    console.error = jest.fn();
});

afterAll(async () => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;

    // Close database connection pool to prevent hanging tests
    try {
        const { pool } = await import('../infrastructure/db/mysql.js');
        await pool.end();
    } catch (error) {
        // Ignore error if pool is not initialized
    }
});

// Global test database cleanup
beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
