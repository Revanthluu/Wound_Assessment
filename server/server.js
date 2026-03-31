import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { register, login, getUsers, updateProfile, generatePatientCredentials } from './authController.js';

import { createServer } from 'http';
import { initSocket } from './socketManager.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5001;

initSocket(httpServer);

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth Routes
app.post('/api/register', register);
app.post('/api/login', login);
app.get('/api/users', getUsers);
app.put('/api/users/:id', updateProfile);

import { getPatients, createPatient, updatePatientStatus, updatePatient } from './patientController.js';
import { getAssessments, createAssessment, getAssessmentById } from './assessmentController.js';
import { getAlerts, createAlert, markAsRead, markAllAsRead } from './alertController.js';
import { getTasks, createTask, updateTaskStatus } from './taskController.js';

// Patient Routes
app.get('/api/patients', getPatients);
app.post('/api/patients', createPatient);
app.put('/api/patients/:id/status', updatePatientStatus);
app.post('/api/patients/:id/credentials', generatePatientCredentials);
app.put('/api/patients/:id', updatePatient);

// Assessment Routes
app.get('/api/assessments', getAssessments);
app.get('/api/assessments/:id', getAssessmentById);
app.post('/api/assessments', createAssessment);

// Alert Routes
app.get('/api/alerts', getAlerts);
app.post('/api/alerts', createAlert);
app.put('/api/alerts/read-all', markAllAsRead);
app.put('/api/alerts/:id/read', markAsRead);

// Task Routes
app.get('/api/tasks', getTasks);
app.post('/api/tasks', createTask);
app.put('/api/tasks/:id/status', updateTaskStatus);

// Static File Serving
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Backend API is running. To serve the frontend here, please build it first using `npm run build`.');
    }
});

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
