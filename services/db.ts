import { Patient, Assessment, UserRole, User, Task } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export class APIError extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'APIError';
  }
}

export const db = {
  async login(email: string, pass: string): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(data.message || 'Login failed');
      }

      sessionStorage.setItem('token', data.token);

      const user: User = {
        ...data.user,
        visitCount: data.user.visitCount || 1,
        lastLogin: new Date().toISOString()
      };

      return user;
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError('Network error or server unavailable');
    }
  },

  async register(userData: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.pass,
          fullName: userData.fullName,
          role: userData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new APIError(data.message || 'Registration failed');
      }

      return true;
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError('Network error or server unavailable');
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async getPatients(): Promise<Patient[]> {
    try {
      const response = await fetch(`${API_URL}/patients`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async getPatientsByNurse(nurseId: number): Promise<Patient[]> {
    try {
      const tasks = await this.getTasks('NURSE', nurseId);
      const patientIds = new Set(tasks.map(t => t.patient_id));
      const allPatients = await this.getPatients();
      return allPatients.filter(p => patientIds.has(p.id));
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async getPatientById(id: string): Promise<Patient | null> {
    const patients = await this.getPatients();
    return patients.find(p => p.id === id) || null;
  },

  async getPatientByUserId(userId: number): Promise<Patient | null> {
    const patients = await this.getPatients();
    return patients.find(p => (p as any).user_id === userId) || null;
  },

  async createPatient(patient: Patient): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new APIError(data.message || 'Failed to create patient');
      }
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async updatePatientStatus(id: string, status: 'Active' | 'Recovered'): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/patients/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new APIError(data.message || 'Failed to update patient status');
      }
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async getAssessments(): Promise<Assessment[]> {
    try {
      const response = await fetch(`${API_URL}/assessments`);
      if (!response.ok) throw new Error('Failed to fetch assessments');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async getAssessmentById(id: string): Promise<Assessment | null> {
    try {
      const response = await fetch(`${API_URL}/assessments/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch assessment detail');
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  },

  async getAssessmentsByPatient(patientId: string): Promise<Assessment[]> {
    const assessments = await this.getAssessments();
    return assessments.filter(a => a.patient_id === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async saveAssessment(assessment: Assessment): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessment)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new APIError(data.message || 'Failed to save assessment');
      }
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async updateProfile(userId: string, data: { fullName: string; email: string; password?: string }): Promise<User | null> {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new APIError(result.message || 'Update failed');
      }

      return result.user;
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError('Network error or server unavailable');
    }
  },

  async getAlerts(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/alerts`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async createAlert(alert: { patient_id: string; assessment_id: string; message: string }): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  async markAlertAsRead(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/alerts/${id}/read`, {
        method: 'PUT'
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  async markAllAlertsAsRead(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/alerts/read-all`, {
        method: 'PUT'
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  async getTasks(role: string, id: number): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/tasks?role=${role}&id=${id}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async createTask(task: any): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  async updateTaskStatus(id: number, status: 'PENDING' | 'COMPLETED'): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return response.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
};
