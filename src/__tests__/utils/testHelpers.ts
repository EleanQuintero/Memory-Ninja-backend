import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

// Mock data types for flashcards
export interface MockFlashcard {
    question: string;
    answer: string;
    theme: string;
}

export interface MockFlashcardData {
    flashcard_id: number;
    question: string;
    answer: string;
    theme: string;
}

// Helper to create mock database connection
export const createMockConnection = (): jest.Mocked<PoolConnection> => {
    return {
        beginTransaction: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        release: jest.fn(),
        execute: jest.fn(),
        query: jest.fn(),
    } as any;
};

// Helper to create mock query results
export const createMockQueryResult = (data: any[], insertId?: number): [RowDataPacket[], any] => {
    const result = data as RowDataPacket[];
    const metadata = insertId ? { insertId } as ResultSetHeader : {};
    return [result, metadata];
};

// Helper to create mock insert result
export const createMockInsertResult = (insertId: number, affectedRows: number = 1): [ResultSetHeader, any] => {
    const result = { insertId, affectedRows } as ResultSetHeader;
    return [result, {}];
};

// Helper to simulate database errors
export const createDatabaseError = (message: string): Error => {
    const error = new Error(message);
    error.name = 'DatabaseError';
    return error;
};

// Helper to create test user data
export const createTestUser = (id: string = '1') => ({
    id,
    name: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    role: 'user',
});

// Helper to create test flashcard
export const createTestFlashcard = (overrides: Partial<MockFlashcard> = {}): MockFlashcard => ({
    question: '¿Qué es TypeScript?',
    answer: 'TypeScript es un superset de JavaScript que añade tipado estático',
    theme: 'Programación',
    ...overrides,
});

// Helper to create multiple test flashcards
export const createTestFlashcards = (count: number): MockFlashcard[] => {
    return Array.from({ length: count }, (_, index) => ({
        question: `Pregunta de prueba ${index + 1}`,
        answer: `Respuesta de prueba ${index + 1}`,
        theme: index % 2 === 0 ? 'Programación' : 'Testing',
    }));
};

// Helper to create flashcard sync data
export const createFlashcardSyncData = (userId: string, flashcards: MockFlashcard[]) => ({
    user_id: userId,
    flashcard: flashcards,
});

// Helper to assert mock call with partial matching
export const expectMockCalledWith = (mockFn: jest.Mock, callIndex: number, ...expectedArgs: any[]) => {
    expect(mockFn).toHaveBeenNthCalledWith(callIndex + 1, ...expectedArgs);
};

// Helper to wait for async operations
export const waitFor = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
