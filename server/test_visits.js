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

    // Create a new temporary user for this test.
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
