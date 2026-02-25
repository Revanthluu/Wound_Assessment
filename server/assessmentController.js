import db from './db.js';

export const getAssessments = async (req, res) => {
    try {
        // Fetch assessments. Note: Fetching all images might be heavy if list is long.
        // For a real app, we might exclude image_data from list view and fetch detail separately.
        // But for parity with currect app logic, we'll fetch everything.
        const [assessments] = await db.query(`
            SELECT 
                id, patient_id, date, wound_location, wound_type, wound_stage, 
                length_cm, width_cm, depth_cm, pain_level, notes, 
                granulation_pct, epithelial_pct, slough_pct, eschar_pct,
                marker_data, status, doctor_suggestion 
            FROM assessments 
            ORDER BY date DESC
        `);

        return res.json(assessments);
    } catch (error) {
        console.error('Error fetching assessments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createAssessment = async (req, res) => {
    try {
        const assessment = req.body;

        const query = `
            INSERT INTO assessments (
                id, patient_id, date, wound_location, wound_type, wound_stage,
                length_cm, width_cm, depth_cm, pain_level, notes, 
                granulation_pct, epithelial_pct, slough_pct, eschar_pct,
                marker_data, status, image_data, doctor_suggestion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [
            assessment.id, assessment.patient_id, new Date(assessment.date),
            assessment.wound_location, assessment.wound_type, assessment.wound_stage,
            assessment.length_cm, assessment.width_cm, assessment.depth_cm,
            assessment.pain_level, assessment.notes,
            assessment.granulation_pct, assessment.epithelial_pct, assessment.slough_pct, assessment.eschar_pct,
            assessment.marker_data, assessment.status, assessment.image_data, assessment.doctor_suggestion
        ]);

        res.status(201).json({ message: 'Assessment saved successfully' });
    } catch (error) {
        console.error('Error saving assessment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getAssessmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const [assessments] = await db.query('SELECT * FROM assessments WHERE id = ?', [id]);

        if (assessments.length === 0) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        const a = assessments[0];
        res.json(a);
    } catch (error) {
        console.error('Error fetching assessment detail:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
