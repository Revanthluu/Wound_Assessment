
import db from './db.js';

const migrate = async () => {
    try {
        console.log('Migrating users table to include NURSE role...');
        await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('DOCTOR', 'NURSE', 'PATIENT') NOT NULL DEFAULT 'DOCTOR'");
        console.log('Migration successful.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
