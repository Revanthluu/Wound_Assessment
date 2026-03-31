import db from './db.js';

async function update() {
    try {
        console.log('Searching for Dr. Revanth...');
        const [users] = await db.query('SELECT id, full_name FROM users WHERE full_name LIKE \'%revanth%\' OR email LIKE \'%revanth%\'');
        
        if (users.length === 0) {
            console.log('No user found with name/email containing "revanth".');
            process.exit(1);
        }

        const user = users[0];
        console.log(`Found user: ${user.full_name} (ID: ${user.id})`);

        await db.query('UPDATE users SET age = 32, experience = \'neurogolist\' WHERE id = ?', [user.id]);
        console.log('Updated age and experience successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
}

update();
