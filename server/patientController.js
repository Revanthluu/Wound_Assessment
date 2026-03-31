import db from './db.js';
import { getIO } from './socketManager.js';

export const getPatients = async (req, res) => {
    try {
        const { role, userId } = req.query;
        let query = 'SELECT DISTINCT p.* FROM patients p';
        let params = [];

        if (role === 'NURSE' && userId) {
            query += ' JOIN tasks t ON p.id = t.patient_id WHERE t.nurse_id = ?';
            params.push(userId);
        } else if (role === 'DOCTOR' && userId) {
            query += ' WHERE p.doctor_id = ?';
            params.push(userId);
        }

        query += ' ORDER BY p.created_at DESC';
        const [patients] = await db.query(query, params);

        // Convert field names to match frontend expectations (camelCase)
        const formattedPatients = patients.map(p => ({
            id: p.id,
            mrn: p.mrn,
            firstName: p.first_name,
            lastName: p.last_name,
            dob: p.dob,
            gender: p.gender,
            admissionDate: p.admission_date,
            ward: p.ward,
            room: p.room,
            diagnosis: p.diagnosis,
            previousWound: p.previous_wound,
            healingTime: p.healing_time,
            diabetes: p.diabetes,
            ulcer: p.ulcer,
            bp: p.bp,
            status: p.status,
            user_id: p.user_id,
            doctor_id: p.doctor_id
        }));
        res.json(formattedPatients);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createPatient = async (req, res) => {
    try {
        const patient = req.body;

        // Check if MRN exists
        const [existing] = await db.query('SELECT * FROM patients WHERE mrn = ?', [patient.mrn]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'MRN already exists' });
        }

        const query = `
            INSERT INTO patients (id, mrn, first_name, last_name, dob, gender, admission_date, ward, room, diagnosis, previous_wound, healing_time, diabetes, ulcer, bp, user_id, doctor_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [
            patient.id, patient.mrn, patient.firstName, patient.lastName,
            patient.dob, patient.gender, patient.admissionDate,
            patient.ward, patient.room, patient.diagnosis,
            patient.previousWound || null, patient.healingTime || null,
            patient.diabetes || null, patient.ulcer || null, patient.bp || null,
            patient.user_id, patient.doctor_id || null
        ]);

        res.status(201).json({ message: 'Patient created successfully' });
    } catch (error) {
        console.error('Error creating patient:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePatientStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['Active', 'Recovered'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await db.query('UPDATE patients SET status = ? WHERE id = ?', [status, id]);

        res.json({ message: 'Patient status updated successfully.', status });
        getIO().emit('PATIENT_STATUS_UPDATED', { id, status });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePatient = async (req, res) => {
    try {
        const { id } = req.params;
        const patient = req.body;

        const query = `
            UPDATE patients 
            SET mrn = ?, first_name = ?, last_name = ?, dob = ?, gender = ?, ward = ?, room = ?, diagnosis = ?, 
                previous_wound = ?, healing_time = ?, diabetes = ?, ulcer = ?, bp = ?, doctor_id = ?
            WHERE id = ?
        `;

        await db.query(query, [
            patient.mrn, patient.firstName, patient.lastName, patient.dob, 
            patient.gender, patient.ward, patient.room, patient.diagnosis, 
            patient.previousWound || null, patient.healingTime || null,
            patient.diabetes || null, patient.ulcer || null, patient.bp || null,
            patient.doctor_id || null, id
        ]);

        res.json({ message: 'Patient updated successfully' });
        getIO().emit('PATIENT_UPDATED', { id, ...patient });
    } catch (error) {
        console.error('Error updating patient:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
