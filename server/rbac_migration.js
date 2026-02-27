import db from './db.js';

const migrate = async () => {
    try {
        console.log('Running RBAC Migration...');

        // 1. Update user role enum
        await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT') NOT NULL DEFAULT 'DOCTOR'");
        console.log('✅ Updated users.role enum.');

        // 2. Add status and user_id to patients
        try {
            await db.query("ALTER TABLE patients ADD COLUMN status ENUM('Active', 'Recovered') NOT NULL DEFAULT 'Active'");
            console.log('✅ Added status to patients.');
        } catch (e) {
            console.log('ℹ️ patients.status already exists.');
        }

        try {
            await db.query("ALTER TABLE patients ADD COLUMN user_id INT");
            await db.query("ALTER TABLE patients ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL");
            console.log('✅ Added user_id and foreign key to patients.');
        } catch (e) {
            console.log('ℹ️ patients.user_id already exists.');
        }

        // 3. Create tasks table
        await db.query(`
            CREATE TABLE IF NOT EXISTS tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                doctor_id INT NOT NULL,
                nurse_id INT NOT NULL,
                patient_id VARCHAR(50) NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                due_date DATETIME,
                status ENUM('PENDING', 'COMPLETED') DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (nurse_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Created tasks table.');

        console.log('RBAC Migration completed successfuly.');
        process.exit(0);
    } catch (error) {
        console.error('RBAC Migration failed:', error);
        process.exit(1);
    }
};

migrate();
