
import db from './db.js';

const checkPatients = async () => {
    try {
        const [patients] = await db.query('SELECT * FROM patients');
        console.log('Patients in DB:', patients.length);
        if (patients.length > 0) console.log(patients[0]);
        process.exit(0);
    } catch (error) {
        console.error('Error fetching patients:', error);
        process.exit(1);
    }
};

checkPatients();
