import bcrypt from 'bcrypt';
import db from './db.js';

const updateAdmin = async () => {
    try {
        const email = 'admin@mediwound.ai';
        const newPassword = 'Admin@123';
        const newRole = 'ADMIN';

        console.log(`Updating ${email}...`);

        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log('Altering table schema...');
        await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT') NOT NULL DEFAULT 'DOCTOR'");

        console.log('Updating user record...');
        const [result] = await db.query(
            'UPDATE users SET role = ?, password_hash = ? WHERE email = ?',
            [newRole, hashedPassword, email]
        );

        console.log('Update result:', result);
        if (result.affectedRows > 0) {
            console.log('✅ Successfully updated role to ADMIN and password to Admin@123');
        } else {
            console.log('❌ User not found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('CRITICAL ERROR:', error);
        process.exit(1);
    }
};

updateAdmin();
