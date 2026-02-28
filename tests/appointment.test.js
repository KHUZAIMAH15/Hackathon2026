const request = require('supertest');
const app = require('../server');
const { connectDB, closeDB, clearDB } = require('./setup');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

let adminToken, doctorToken, patientToken, receptionistToken;
let doctorId, patientId;

beforeAll(async () => {
  await connectDB();

  // Create admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
  });

  // Create doctor
  const doctor = await User.create({
    name: 'Dr. Test',
    email: 'doctor@test.com',
    password: 'password123',
    role: 'doctor',
    specialization: 'Cardiology'
  });
  doctorId = doctor._id;

  // Create patient
  const patient = await User.create({
    name: 'Test Patient',
    email: 'patient@test.com',
    password: 'password123',
    role: 'patient'
  });
  patientId = patient._id;

  // Create receptionist
  await User.create({
    name: 'Receptionist Test',
    email: 'receptionist@test.com',
    password: 'password123',
    role: 'receptionist'
  });

  // Login and get tokens
  const adminRes = await request(app).post('/api/auth/login').send({
    email: 'admin@test.com',
    password: 'password123'
  });
  adminToken = adminRes.body.data.token;

  const doctorRes = await request(app).post('/api/auth/login').send({
    email: 'doctor@test.com',
    password: 'password123'
  });
  doctorToken = doctorRes.body.data.token;

  const patientRes = await request(app).post('/api/auth/login').send({
    email: 'patient@test.com',
    password: 'password123'
  });
  patientToken = patientRes.body.data.token;

  const receptionistRes = await request(app).post('/api/auth/login').send({
    email: 'receptionist@test.com',
    password: 'password123'
  });
  receptionistToken = receptionistRes.body.data.token;
});

afterEach(async () => {
  await clearDB();
  
  // Recreate users after clear
  const doctor = await User.create({
    name: 'Dr. Test',
    email: 'doctor@test.com',
    password: 'password123',
    role: 'doctor',
    specialization: 'Cardiology'
  });

  const patient = await User.create({
    name: 'Test Patient',
    email: 'patient@test.com',
    password: 'password123',
    role: 'patient'
  });

  doctorId = doctor._id;
  patientId = patient._id;
});

afterAll(async () => {
  await closeDB();
});

describe('Appointment Tests', () => {
  describe('POST /api/receptionist/appointments', () => {
    it('should book an appointment successfully', async () => {
      const appointmentData = {
        patientId,
        doctorId,
        appointmentDate: '2026-04-01',
        time: '10:00',
        reason: 'Regular checkup'
      };

      const res = await request(app)
        .post('/api/receptionist/appointments')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send(appointmentData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('appointmentDate');
      expect(res.body.data.reason).toBe('Regular checkup');
    });

    it('should fail booking without required fields', async () => {
      const res = await request(app)
        .post('/api/receptionist/appointments')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({ patientId })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should fail booking for past date', async () => {
      const appointmentData = {
        patientId,
        doctorId,
        appointmentDate: '2020-01-01',
        time: '10:00',
        reason: 'Regular checkup'
      };

      const res = await request(app)
        .post('/api/receptionist/appointments')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send(appointmentData)
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should fail booking without authentication', async () => {
      const res = await request(app)
        .post('/api/receptionist/appointments')
        .send({ patientId, doctorId, appointmentDate: '2026-04-01', time: '10:00', reason: 'Checkup' })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail booking with non-receptionist role', async () => {
      const res = await request(app)
        .post('/api/receptionist/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({ patientId, doctorId, appointmentDate: '2026-04-01', time: '10:00', reason: 'Checkup' })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/receptionist/appointments', () => {
    beforeEach(async () => {
      await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date('2026-04-01'),
        time: '10:00',
        reason: 'Regular checkup',
        status: 'pending'
      });
    });

    it('should get all appointments', async () => {
      const res = await request(app)
        .get('/api/receptionist/appointments')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should filter appointments by status', async () => {
      const res = await request(app)
        .get('/api/receptionist/appointments?status=pending')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      res.body.data.forEach(apt => {
        expect(apt.status).toBe('pending');
      });
    });
  });

  describe('GET /api/doctor/appointments', () => {
    beforeEach(async () => {
      await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date('2026-04-01'),
        time: '10:00',
        reason: 'Regular checkup',
        status: 'pending'
      });
    });

    it('should get doctor appointments', async () => {
      const res = await request(app)
        .get('/api/doctor/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });

    it('should fail for non-doctor role', async () => {
      const res = await request(app)
        .get('/api/doctor/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/patient/appointments', () => {
    beforeEach(async () => {
      await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        appointmentDate: new Date('2026-04-01'),
        time: '10:00',
        reason: 'Regular checkup',
        status: 'pending'
      });
    });

    it('should get patient appointments', async () => {
      const res = await request(app)
        .get('/api/patient/appointments')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });
});
