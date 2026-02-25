import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login, getUsers, updateProfile } from './authController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Auth Routes
app.post('/api/register', register);
app.post('/api/login', login);
app.get('/api/users', getUsers);
app.put('/api/users/:id', updateProfile);

import { getPatients, createPatient, updatePatientStatus } from './patientController.js';
import { getAssessments, createAssessment, getAssessmentById } from './assessmentController.js';
import { getAlerts, createAlert, markAsRead, markAllAsRead } from './alertController.js';

// Patient Routes
app.get('/api/patients', getPatients);
app.post('/api/patients', createPatient);
app.put('/api/patients/:id/status', updatePatientStatus);

// Assessment Routes
app.get('/api/assessments', getAssessments);
app.get('/api/assessments/:id', getAssessmentById);
app.post('/api/assessments', createAssessment);

// Alert Routes
app.get('/api/alerts', getAlerts);
app.post('/api/alerts', createAlert);
app.put('/api/alerts/read-all', markAllAsRead);
app.put('/api/alerts/:id/read', markAsRead);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
