import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.js';

export const register = async (req, res) => {
    try {
        const { email, password, fullName, role } = req.body;

        if (!email || !password || !fullName || !role) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if user exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, fullName, role]
        );


        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Update last login and visit count
        await db.query('UPDATE users SET last_login = NOW(), visit_count = visit_count + 1 WHERE id = ?', [user.id]);


        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                age: user.age,
                experience: user.experience,
                gender: user.gender,
                license_no: user.license_no
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, email, full_name as fullName, role, last_login as lastLogin, visit_count as visitCount, age, experience, gender, license_no FROM users');
        res.json(users);
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, password, age, experience, gender, license_no } = req.body;

        if (!fullName || !email) {
            return res.status(400).json({ message: 'Full name and email are required.' });
        }

        let query = 'UPDATE users SET full_name = ?, email = ?';
        let params = [fullName, email];

        if (age !== undefined) {
            query += ', age = ?';
            params.push(age);
        }

        if (experience !== undefined) {
            query += ', experience = ?';
            params.push(experience);
        }

        if (gender !== undefined) {
            query += ', gender = ?';
            params.push(gender);
        }

        if (license_no !== undefined) {
            query += ', license_no = ?';
            params.push(license_no);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password_hash = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.query(query, params);

        res.json({
            message: 'Profile updated successfully.',
            user: { id, fullName, email, age, experience, gender, license_no }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already in use.' });
        }
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const generatePatientCredentials = async (req, res) => {
    try {
        const { id } = req.params; // Patient ID
        const { email, password, fullName } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'Email, password, and full name are required.' });
        }

        // Check if patient exists
        const [patients] = await db.query('SELECT * FROM patients WHERE id = ?', [id]);
        if (patients.length === 0) {
            return res.status(404).json({ message: 'Patient not found.' });
        }

        const patient = patients[0];
        if (patient.user_id) {
            return res.status(409).json({ message: 'Patient already has credentials.' });
        }

        // Check if email is already registered
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email already registered.' });
        }

        // Hash temporary password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user specifically for Patient
        const [userResult] = await db.query(
            'INSERT INTO users (email, password_hash, full_name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, fullName, 'PATIENT']
        );

        const newUserId = userResult.insertId;

        // Update patient to link to new user
        await db.query('UPDATE patients SET user_id = ? WHERE id = ?', [newUserId, id]);

        res.status(201).json({ message: 'Patient credentials generated successfully.', userId: newUserId });
    } catch (error) {
        console.error('Generate patient credentials error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
