# Gestión de Productos - Actividad 4 DFS

Aplicación web para la gestión de productos con autenticación JWT, desarrollada con Node.js, Express.js y MongoDB.

## Requisitos previos

- Node.js 18+
- MongoDB (local o Atlas)
- npm

## Instalación

```bash
git clone <url-del-repositorio>
cd actividad4dfs
npm install
```

## Configuración

Crea un archivo `.env` basándote en `.env.example`:

```
PORT=3000
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/actividad4dfs
JWT_SECRET=una_clave_secreta_segura
```

## Ejecución

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Pruebas

```bash
npm test
```

## Endpoints de la API

### Autenticación

| Método | Ruta               | Descripción           | Protegida |
|--------|--------------------|-----------------------|-----------|
| POST   | /api/auth/registro | Registrar usuario     | No        |
| POST   | /api/auth/login    | Iniciar sesión        | No        |
| GET    | /api/auth/perfil   | Ver perfil de usuario | Sí        |

### Productos

| Método | Ruta                  | Descripción           | Protegida |
|--------|-----------------------|-----------------------|-----------|
| GET    | /api/productos        | Listar productos      | Sí        |
| GET    | /api/productos/:id    | Ver un producto       | Sí        |
| POST   | /api/productos        | Crear producto        | Sí        |
| PUT    | /api/productos/:id    | Actualizar producto   | Sí        |
| DELETE | /api/productos/:id    | Eliminar producto     | Sí        |

## Estructura del proyecto

```
actividad4dfs/
├── .github/workflows/ci-cd.yml
├── src/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── productController.js
│   ├── middlewares/auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Product.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── productRoutes.js
│   ├── public/login.html
│   ├── app.js
│   └── server.js
├── tests/
│   ├── auth.test.js
│   └── product.test.js
├── vercel.json
├── package.json
└── README.md
```

## Despliegue

La aplicación se despliega automáticamente en **Vercel** al hacer push a la rama `main` mediante el pipeline de GitHub Actions.

### Variables de entorno en Vercel

Configura en el dashboard de Vercel:
- `MONGODB_URI`
- `JWT_SECRET`

### Secrets de GitHub Actions

Configura en Settings > Secrets del repositorio:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
