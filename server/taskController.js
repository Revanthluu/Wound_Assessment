import db from './db.js';
import { getIO } from './socketManager.js';

export const getTasks = async (req, res) => {
    try {
        const { role, id } = req.query;
        let query = `
            SELECT t.*, p.first_name, p.last_name, u.full_name as doctor_name, n.full_name as nurse_name 
            FROM tasks t 
            JOIN patients p ON t.patient_id = p.id 
            JOIN users u ON t.doctor_id = u.id
            JOIN users n ON t.nurse_id = n.id
        `;
        let params = [];

        if (role === 'NURSE') {
            query += ' WHERE t.nurse_id = ?';
            params.push(id);
        } else if (role === 'DOCTOR') {
            query += ' WHERE t.doctor_id = ?';
            params.push(id);
        }

        query += ' ORDER BY t.created_at DESC';
        const [tasks] = await db.query(query, params);
        res.json(tasks);
    } catch (error) {
        console.error('Fetch tasks error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const createTask = async (req, res) => {
    try {
        const { doctor_id, nurse_id, patient_id, title, description, due_date } = req.body;
        const finalDueDate = due_date || null;
        await db.query(
            'INSERT INTO tasks (doctor_id, nurse_id, patient_id, title, description, due_date) VALUES (?, ?, ?, ?, ?, ?)',
            [doctor_id, nurse_id, patient_id, title, description, finalDueDate]
        );
        res.status(201).json({ message: 'Task created successfully.' });
        getIO().emit('TASK_CREATED', { doctor_id, nurse_id, patient_id, title });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, nurse_note } = req.body;
        await db.query('UPDATE tasks SET status = ?, nurse_note = ? WHERE id = ?', [status, nurse_note, id]);
        res.json({ message: 'Task status updated.' });
        getIO().emit('TASK_UPDATED', { id, status });
    } catch (error) {
        console.error('Update task status error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
