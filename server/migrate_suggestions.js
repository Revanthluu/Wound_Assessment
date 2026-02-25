import db from './db.js';

const migrateSuggestions = async () => {
    try {
        console.log('Starting migration: Adding doctor_suggestion to assessments table...');

        const query = `
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'assessments' AND COLUMN_NAME = 'doctor_suggestion';
        `;

        const [results] = await db.query(query, [process.env.DB_NAME || 'woundanalysis']);

        if (results.length === 0) {
            await db.query(`
                ALTER TABLE assessments
                ADD COLUMN doctor_suggestion TEXT;
            `);
            console.log('✅ Successfully added doctor_suggestion column.');
        } else {
            console.log('ℹ️ doctor_suggestion column already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

migrateSuggestions();
