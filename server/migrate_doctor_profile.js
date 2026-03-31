import db from './db.js';

async function migrate() {
    try {
        console.log('Checking columns in users table...');
        const [columns] = await db.query('SHOW COLUMNS FROM users');
        const hasAge = columns.some(c => c.Field === 'age');
        const hasExperience = columns.some(c => c.Field === 'experience');

        if (!hasAge) {
            await db.query('ALTER TABLE users ADD COLUMN age INT DEFAULT NULL');
            console.log('Added age column.');
        } else {
            console.log('Age column already exists.');
        }

        if (!hasExperience) {
            await db.query('ALTER TABLE users ADD COLUMN experience INT DEFAULT NULL');
            console.log('Added experience column.');
        } else {
            console.log('Experience column already exists.');
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
