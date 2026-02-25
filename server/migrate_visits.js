
import db from './db.js';

const migrate = async () => {
    try {
        console.log('Adding visit_count column to users table...');
        try {
            await db.query("ALTER TABLE users ADD COLUMN visit_count INT DEFAULT 0");
            console.log('Column added.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column already exists.');
            } else {
                throw err;
            }
        }
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
