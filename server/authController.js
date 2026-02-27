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
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const getUsers = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, email, full_name as fullName, role, last_login as lastLogin, visit_count as visitCount FROM users');
        res.json(users);
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, email, password } = req.body;

        if (!fullName || !email) {
            return res.status(400).json({ message: 'Full name and email are required.' });
        }

        let query = 'UPDATE users SET full_name = ?, email = ?';
        let params = [fullName, email];

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
            user: { id, fullName, email }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already in use.' });
        }
        res.status(500).json({ message: 'Internal server error.' });
    }
};
