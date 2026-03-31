import db from './db.js';

async function migrate() {
    try {
        console.log('Modifying experience column to VARCHAR(255)...');
        await db.query('ALTER TABLE users MODIFY COLUMN experience VARCHAR(255)');
        console.log('Modified experience column successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
