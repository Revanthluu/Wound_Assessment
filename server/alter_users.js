import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env.local') }); // checking typical React environments
dotenv.config();

const dbConfig = process.env.DATABASE_URL ? {
  uri: process.env.DATABASE_URL
} : {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'mediwound_ai'
};

async function run() {
    try {
        const pool = mysql.createPool(dbConfig);
        await pool.query(`ALTER TABLE users ADD COLUMN license_no VARCHAR(100) DEFAULT 'N/A'`);
        console.log("Success: added license_no column to users table");
    } catch (e) {
        console.log("Information/Warning:", e.message);
    }
    process.exit(0);
}
run();
