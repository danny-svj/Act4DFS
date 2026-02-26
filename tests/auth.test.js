process.env.JWT_SECRET = 'test_secret_key';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('POST /api/auth/registro', () => {
  it('registra un usuario nuevo correctamente', async () => {
    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Carlos', email: 'carlos@test.com', password: '123456' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.nombre).toBe('Carlos');
  });

  it('rechaza registro con email duplicado', async () => {
    await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Ana', email: 'ana@test.com', password: '123456' });

    const res = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Ana 2', email: 'ana@test.com', password: '654321' });

    expect(res.status).toBe(400);
    expect(res.body.mensaje).toContain('ya está registrado');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'Luis', email: 'luis@test.com', password: '123456' });
  });

  it('inicia sesión con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'luis@test.com', password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.email).toBe('luis@test.com');
  });

  it('rechaza credenciales inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'luis@test.com', password: 'incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body.mensaje).toContain('Credenciales inválidas');
  });

  it('rechaza email inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: '123456' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/perfil', () => {
  it('devuelve el perfil con token válido', async () => {
    const registro = await request(app)
      .post('/api/auth/registro')
      .send({ nombre: 'María', email: 'maria@test.com', password: '123456' });

    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', `Bearer ${registro.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('María');
    expect(res.body.password).toBeUndefined();
  });

  it('rechaza acceso sin token', async () => {
    const res = await request(app).get('/api/auth/perfil');
    expect(res.status).toBe(401);
  });

  it('rechaza token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/perfil')
      .set('Authorization', 'Bearer token_falso_123');

    expect(res.status).toBe(403);
  });
});
