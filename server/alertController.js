import db from './db.js';

export const getAlerts = async (req, res) => {
    try {
        const [alerts] = await db.query(`
            SELECT a.*, p.first_name, p.last_name 
            FROM alerts a 
            JOIN patients p ON a.patient_id = p.id 
            WHERE a.is_read = FALSE 
            ORDER BY a.created_at DESC
        `);
        res.json(alerts);
    } catch (error) {
        console.error('Fetch alerts error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const createAlert = async (req, res) => {
    try {
        const { patient_id, assessment_id, message } = req.body;
        if (!patient_id || !assessment_id || !message) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        await db.query(
            'INSERT INTO alerts (patient_id, assessment_id, message) VALUES (?, ?, ?)',
            [patient_id, assessment_id, message]
        );

        res.status(201).json({ message: 'Alert created successfully.' });
    } catch (error) {
        console.error('Create alert error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE alerts SET is_read = TRUE WHERE id = ?', [id]);
        res.json({ message: 'Alert marked as read.' });
    } catch (error) {
        console.error('Mark alert as read error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await db.query('UPDATE alerts SET is_read = TRUE');
        res.json({ message: 'All alerts marked as read.' });
    } catch (error) {
        console.error('Mark all alerts as read error:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
