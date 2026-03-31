import db from './db.js';

async function migrate() {
    console.log('Starting migration to add doctor_id to patients table...');
    try {
        await db.query(`
            ALTER TABLE patients
            ADD COLUMN doctor_id INT,
            ADD CONSTRAINT fk_doctor_id FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE SET NULL
        `);
        console.log('Successfully added doctor_id column and foreign key.');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('doctor_id column already exists. Skipping...');
        } else {
            console.error('Error during migration:', error);
        }
    } finally {
        process.exit(0);
    }
}

migrate();
