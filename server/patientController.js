import db from './db.js';

export const getPatients = async (req, res) => {
    try {
        const [patients] = await db.query('SELECT * FROM patients ORDER BY created_at DESC');
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
            status: p.status
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
            INSERT INTO patients (id, mrn, first_name, last_name, dob, gender, admission_date, ward, room, diagnosis)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [
            patient.id, patient.mrn, patient.firstName, patient.lastName,
            patient.dob, patient.gender, patient.admissionDate,
            patient.ward, patient.room, patient.diagnosis
        ]);

        res.status(201).json({ message: 'Patient created successfully' });
    } catch (error) {
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
    } catch (error) {
        console.error('Error updating patient status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
