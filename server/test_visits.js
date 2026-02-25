
import { login } from './authController.js';
import db from './db.js';

// Mock req, res
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const testVisits = async () => {
    // 1. Get a user
    const [users] = await db.query('SELECT * FROM users LIMIT 1');
    if (users.length === 0) {
        console.log('No users found to test.');
        process.exit(1);
    }
    const user = users[0];
    const initialVisits = user.visit_count || 0;
    console.log(`User ${user.email} initial visits: ${initialVisits}`);

    // 2. Login
    // Note: Use a known password or reset it. Since I cannot know the real password of existing users easily without resetting, 
    // I will use the user created in previous test if possible, or creates a new one.
    // Actually, I'll creates a NEW user to be sure.

    // Let's rely on the previous test_auth.js user if I can finding the password, 
    // BUT simplest is just to CREATE a new user for this test to avoid password issues.

    // Re-using logic from test_auth would be cleaner but I want to be specific about visits.
    // let's just insert a user manually with known hash if needed, or just use the code to register one.

    // I will use a simple update to set a known password hash for the 'test' user from before or just create a new one.
    // Let's create a new temporary user for this test.

    const testEmail = `visit_test_${Date.now()}@example.com`;
    const testPass = 'password123';

    // Import register to create user
    const { register } = await import('./authController.js');

    await register({
        body: { email: testEmail, password: testPass, fullName: 'Visit Tester', role: 'DOCTOR' }
    }, mockRes());

    // Get that user
    const [freshUserList] = await db.query('SELECT * FROM users WHERE email = ?', [testEmail]);
    const freshUser = freshUserList[0];
    console.log(`Created user ${freshUser.email} with visits: ${freshUser.visit_count}`);

    // Login 1
    console.log('Logging in...');
    await login({
        body: { email: testEmail, password: testPass }
    }, mockRes());

    // Check visits
    const [afterLogin1] = await db.query('SELECT * FROM users WHERE email = ?', [testEmail]);
    console.log(`Visits after login 1: ${afterLogin1[0].visit_count}`);

    if (afterLogin1[0].visit_count !== 1) { // It starts at 0, login makes it 1
        // Wait, default is 0. Register does NOT log in automatically in this app? 
        // Looking at RoleSelection, user registers then logins? Or Register returns token?
        // Login.tsx: "Account created. Please log in." -> Register does NOT login. 
        // So initial should be 0. Login 1 -> 1.
    }

    // Login 2
    console.log('Logging in again...');
    await login({
        body: { email: testEmail, password: testPass }
    }, mockRes());

    const [afterLogin2] = await db.query('SELECT * FROM users WHERE email = ?', [testEmail]);
    console.log(`Visits after login 2: ${afterLogin2[0].visit_count}`);

    if (afterLogin2[0].visit_count > afterLogin1[0].visit_count) {
        console.log('SUCCESS: Visit count incremented.');
        process.exit(0);
    } else {
        console.error('FAILURE: Visit count did not increment.');
        process.exit(1);
    }
};

testVisits();
