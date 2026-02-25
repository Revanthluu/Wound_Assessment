
import pool from './db.js';
import crypto from 'crypto';

const patients = [
    { firstName: "James", lastName: "Wilson", mrn: "MRN-1001", dob: "1945-03-12", gender: "Male", ward: "Cardiology", room: "402", diagnosis: "Chronic Venous Insufficiency" },
    { firstName: "Margaret", lastName: "Thompson", mrn: "MRN-1002", dob: "1938-11-25", gender: "Female", ward: "Geriatrics", room: "215B", diagnosis: "Type 2 Diabetes Mellitus" },
    { firstName: "Robert", lastName: "Chen", mrn: "MRN-1003", dob: "1962-07-08", gender: "Male", ward: "Surgical Recovery", room: "301", diagnosis: "Post-op Wound Dehiscence" },
    { firstName: "Elena", lastName: "Rodriguez", mrn: "MRN-1004", dob: "1955-05-30", gender: "Female", ward: "Intensive Care", room: "ICU-04", diagnosis: "Pressure Injury - Sacrum" },
    { firstName: "Arthur", lastName: "Miller", mrn: "MRN-1005", dob: "1942-01-15", gender: "Male", ward: "General Medicine", room: "512", diagnosis: "Peripheral Arterial Disease" },
    { firstName: "Grace", lastName: "Kim", mrn: "MRN-1006", dob: "1970-09-22", gender: "Female", ward: "Outpatient Care", room: "OP-09", diagnosis: "Traumatic Lacertion" },
    { firstName: "Samuel", lastName: "Brown", mrn: "MRN-1007", dob: "1950-12-04", gender: "Male", ward: "Rehabilitation", room: "R-102", diagnosis: "Neuropathic Foot Ulcer" },
    { firstName: "Barbara", lastName: "White", mrn: "MRN-1008", dob: "1935-06-18", gender: "Female", ward: "Hospice", room: "H-05", diagnosis: "Advanced Pressure Ulcer" },
    { firstName: "Thomas", lastName: "Lee", mrn: "MRN-1009", dob: "1968-02-14", gender: "Male", ward: "Orthopedics", room: "605A", diagnosis: "Bone Fracture with Skin Break" },
    { firstName: "Sarah", lastName: "Johnson", mrn: "MRN-1010", dob: "1958-10-05", gender: "Female", ward: "Cardiology", room: "410", diagnosis: "Stasis Dermatitis" }
];

const suggestions = [
    "Apply hydrocolloid dressing every 3 days. Ensure moisture balance.",
    "Debride slough using enzymatic agent. Monitor for signs of infection.",
    "Continue negative pressure wound therapy (NPWT) at 125mmHg.",
    "Reposition patient every 2 hours. Offload sacral pressure with foam cushion.",
    "Increase dietary protein intake. Apply silver-impregnated antimicrobial dressing.",
    "Manual lymph drainage and compression therapy (30-40 mmHg).",
    "Manage glucose levels. Recommend offloading footwear at all times.",
    "Gentle irrigation with normal saline. Protect periwound skin with zinc paste.",
    "Calcium alginate dressing to manage heavy exudate. Change daily.",
    "Topical corticosteroids for inflammation. Monitor for secondary infection."
];

async function seed() {
    console.log("Starting demo data seeding...");

    try {
        for (const p of patients) {
            const patientId = crypto.randomUUID();
            const admissionDate = new Date();
            admissionDate.setDate(admissionDate.getDate() - 15);

            // Insert Patient with correct column names (snake_case)
            await pool.query(
                "INSERT INTO patients (id, mrn, first_name, last_name, dob, gender, admission_date, ward, room, diagnosis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [patientId, p.mrn, p.firstName, p.lastName, p.dob, p.gender, admissionDate, p.ward, p.room, p.diagnosis]
            );

            console.log(`Added patient: ${p.firstName} ${p.lastName}`);

            // Insert 3 Assessments per patient
            for (let i = 0; i < 3; i++) {
                const assessmentId = crypto.randomBytes(4).toString('hex');
                const date = new Date();
                date.setDate(date.getDate() - (10 - i * 4)); // Visits spaced out

                const granulation = 60 + (i * 10); // Improving progress
                const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

                await pool.query(
                    `INSERT INTO assessments (
            id, patient_id, date, wound_location, wound_type, wound_stage,
            length_cm, width_cm, depth_cm, pain_level, notes, 
            granulation_pct, status, doctor_suggestion
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        assessmentId, patientId, date,
                        "Sacrum", "Pressure Injury", "Stage III",
                        5.0 - (i * 0.5), 4.0 - (i * 0.5), 1.5 - (i * 0.2),
                        6 - i, `Observation visit ${i + 1}. Patient is responding well to treatment.`,
                        granulation, granulation > 70 ? 'Healing' : 'Stable', suggestion
                    ]
                );
            }
        }

        console.log("Seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
