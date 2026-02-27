import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: './server/.env' });

async function findAdmin() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
        });

        const [users] = await pool.query("SELECT email, full_name, role FROM users");
        if (users.length > 0) {
            console.log('--- USER LIST ---');
            users.forEach(u => console.log(`[${u.role}] ${u.full_name}: ${u.email}`));
            console.log('-----------------');
        } else {
            console.log('No users found in the database.');
        }
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

findAdmin();
