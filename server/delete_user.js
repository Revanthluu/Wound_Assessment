import db from './db.js';

async function deleteUser() {
    try {
        const query = "SELECT id, email, full_name, role FROM users WHERE full_name LIKE '%Siddarth%'";
        const [rows] = await db.query(query);

        if (rows.length === 0) {
            console.log('No user found matching "Siddarth"');
            process.exit(0);
        }

        console.log('Found users:', rows);

        for (const user of rows) {
            console.log(`Deleting user: ${user.full_name} (${user.email})`);
            await db.query('DELETE FROM users WHERE id = ?', [user.id]);
        }

        console.log('Successfully removed matching users.');
        process.exit(0);
    } catch (e) {
        console.error('Delete failed:', e);
        process.exit(1);
    }
}
deleteUser();
