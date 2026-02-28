const request = require('supertest');
const app = require('../server');
const { connectDB, closeDB, clearDB } = require('./setup');
const User = require('../models/User');

beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});

describe('Authentication Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new patient successfully', async () => {
      const userData = {
        name: 'Test Patient',
        email: 'patient@test.com',
        password: 'password123',
        phone: '1234567890'
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', userData.email);
      expect(res.body.data.user.role).toBe('patient');
    });

    it('should fail registration with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should fail registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'invalid-email',
          password: 'password123'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should fail registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'test@test.com',
          password: '12345'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    it('should not allow duplicate email registration', async () => {
      const userData = {
        name: 'Test Patient',
        email: 'patient@test.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(res.body.success).toBe(false);
    });

    it('should not allow non-patient role self-registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Doctor',
          email: 'doctor@test.com',
          password: 'password123',
          role: 'doctor'
        })
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        role: 'patient'
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user.email).toBe('test@test.com');
    });

    it('should fail login with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@test.com',
          password: 'password123'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com' })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        role: 'patient'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      token = loginRes.body.data.token;
    });

    it('should get current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('test@test.com');
    });

    it('should fail without token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/password', () => {
    let token;

    beforeEach(async () => {
      await User.create({
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        role: 'patient'
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      token = loginRes.body.data.token;
    });

    it('should update password successfully', async () => {
      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456'
        })
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify new password works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'newpassword456'
        });

      expect(loginRes.body.success).toBe(true);
    });

    it('should fail with wrong current password', async () => {
      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456'
        })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    it('should fail with short new password', async () => {
      const res = await request(app)
        .put('/api/auth/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: '123'
        })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });
});
