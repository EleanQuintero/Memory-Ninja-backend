import mysql from 'mysql2/promise'
import { env } from '../../config/env'

if (!env.DB_DATA.host || !env.DB_DATA.user || !env.DB_DATA.password || !env.DB_DATA.name || !env.DB_DATA.waitForConnections || !env.DB_DATA.connectionLimit) {
    throw new Error('Missing required database configuration in environment variables')
}

export const pool = mysql.createPool({
    host: env.DB_DATA.host,
    user: env.DB_DATA.user,
    password: env.DB_DATA.password,
    database: env.DB_DATA.name,
    waitForConnections: env.DB_DATA.waitForConnections,
    connectionLimit: env.DB_DATA.connectionLimit,
})