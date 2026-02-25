
import { register, login } from './authController.js';
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

const testAuth = async () => {
    const testEmail = `test_${Date.now()}@example.com`;
    const testPass = 'password123';

    console.log('Testing Registration with', testEmail);
    const reqReg = {
        body: {
            email: testEmail,
            password: testPass,
            fullName: 'Test User',
            role: 'DOCTOR'
        }
    };
    const resReg = mockRes();

    await register(reqReg, resReg);
    console.log('Register Status:', resReg.statusCode);
    console.log('Register Response:', resReg.data);

    if (resReg.statusCode !== 201) {
        console.error('Registration failed');
        process.exit(1);
    }

    console.log('Testing Login...');
    const reqLogin = {
        body: {
            email: testEmail,
            password: testPass
        }
    };
    const resLogin = mockRes();

    await login(reqLogin, resLogin);
    console.log('Login Status:', resLogin.statusCode);
    if (resLogin.data.token) console.log('Login Token: [PRESENT]');
    console.log('Login User:', resLogin.data.user);

    process.exit(0);
};

testAuth();
