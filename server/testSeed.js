
import pool from './db.js';
import crypto from 'crypto';

async function testSeed() {
    const patientId = crypto.randomUUID();
    const assessmentId = crypto.randomBytes(4).toString('hex');
    const date = new Date();

    try {
        await pool.query(
            "INSERT INTO patients (id, mrn, firstName, lastName, dob, gender, admissionDate, ward, room, diagnosis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [patientId, "TEST-MRN-" + crypto.randomBytes(2).toString('hex'), "Test", "Patient", "1990-01-01", "Male", new Date(), "Ward", "101", "Diagnosis"]
        );
        console.log("Patient inserted");

        await pool.query(
            "INSERT INTO assessments (id, patient_id, date, wound_location, wound_type, wound_stage, length_cm, width_cm, depth_cm, pain_level, notes, granulation_pct, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [assessmentId, patientId, date, "Loc", "Type", "Stage", 1, 1, 1, 5, "Notes", 50, "Stable"]
        );
        console.log("Assessment inserted");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testSeed();
