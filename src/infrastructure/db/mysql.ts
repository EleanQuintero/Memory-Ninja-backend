import mysql from 'mysql2/promise'
import { DB_DATA } from '../../consts/const'

export const pool = mysql.createPool({
    host: DB_DATA.host,
    user: DB_DATA.user,
    password: DB_DATA.password,
    database: DB_DATA.database,
    waitForConnections: DB_DATA.waitForConnections, 
    connectionLimit: DB_DATA.connectionLimit,
})