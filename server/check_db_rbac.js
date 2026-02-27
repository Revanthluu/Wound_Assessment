import db from './db.js';

async function check() {
    try {
        const [rows] = await db.query('DESCRIBE users');
        console.log('Users table structure:', rows);
        process.exit(0);
    } catch (e) {
        console.error('Check failed:', e);
        process.exit(1);
    }
}
check();
