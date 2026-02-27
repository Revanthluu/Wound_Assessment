import pool from './server/db.js';

async function findAdmin() {
    try {
        const [users] = await pool.query("SELECT email, full_name FROM users WHERE role = 'ADMIN'");
        if (users.length > 0) {
            console.log('Admin Users found:');
            users.forEach(u => console.log(`- ${u.full_name}: ${u.email}`));
        } else {
            console.log('No ADMIN users found in the database.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

findAdmin();
