process.env.JWT_SECRET = 'test_secret_key';

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const res = await request(app)
    .post('/api/auth/registro')
    .send({ nombre: 'Tester', email: 'tester@test.com', password: '123456' });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Product.deleteMany({});
});

describe('POST /api/productos', () => {
  it('crea un producto correctamente', async () => {
    const res = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Laptop', descripcion: 'Laptop gamer', precio: 25000, categoria: 'Electrónica', stock: 10 });

    expect(res.status).toBe(201);
    expect(res.body.producto.nombre).toBe('Laptop');
    expect(res.body.producto.precio).toBe(25000);
  });

  it('rechaza crear producto sin autenticación', async () => {
    const res = await request(app)
      .post('/api/productos')
      .send({ nombre: 'Mouse', precio: 500 });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/productos', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Teclado', precio: 800, stock: 20 });
  });

  it('obtiene la lista de productos', async () => {
    const res = await request(app)
      .get('/api/productos')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('rechaza listar productos sin token', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/productos/:id', () => {
  it('obtiene un producto por su ID', async () => {
    const creado = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Monitor', precio: 5000, stock: 5 });

    const res = await request(app)
      .get(`/api/productos/${creado.body.producto._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Monitor');
  });

  it('devuelve 404 para un ID inexistente', async () => {
    const idFalso = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/productos/${idFalso}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/productos/:id', () => {
  it('actualiza un producto correctamente', async () => {
    const creado = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Audífonos', precio: 1200, stock: 30 });

    const res = await request(app)
      .put(`/api/productos/${creado.body.producto._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ precio: 999, stock: 25 });

    expect(res.status).toBe(200);
    expect(res.body.producto.precio).toBe(999);
    expect(res.body.producto.stock).toBe(25);
  });

  it('devuelve 404 al actualizar producto inexistente', async () => {
    const idFalso = new mongoose.Types.ObjectId();
    const res = await request(app)
      .put(`/api/productos/${idFalso}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ precio: 100 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/productos/:id', () => {
  it('elimina un producto correctamente', async () => {
    const creado = await request(app)
      .post('/api/productos')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Webcam', precio: 700, stock: 15 });

    const res = await request(app)
      .delete(`/api/productos/${creado.body.producto._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toContain('eliminado');
  });

  it('devuelve 404 al eliminar producto inexistente', async () => {
    const idFalso = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/productos/${idFalso}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
