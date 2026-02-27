import db from './db.js';

const checkUsers = async () => {
    try {
        const [users] = await db.query('SELECT * FROM users');
        console.log('Users in DB:', users);
        process.exit(0);
    } catch (error) {
        console.error('Error fetching users:', error);
        process.exit(1);
    }
};

checkUsers();
