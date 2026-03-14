# Express API — Mongoose + TypeScript In Depth

API REST construida con **Node.js**, **Express**, **TypeScript** y **Mongoose** que gestiona dos entidades principales: `Organizacion` y `Usuario`.

---

## Tecnologías

| Paquete | Versión | Uso |
|---|---|---|
| express | ^4.17.3 | Framework HTTP |
| mongoose | ^6.13.9 | ODM para MongoDB |
| joi | ^17.6.0 | Validación de esquemas en peticiones |
| dotenv | ^16.0.0 | Variables de entorno |
| cors | ^2.8.6 | Política de acceso cruzado |
| chalk | ^4.1.2 | Logging con color en consola |
| typescript | ^4.5.5 | Tipado estático (devDependency) |

---

## Estructura del proyecto

```
src/
├── server.ts              # Punto de entrada: conexión a Mongo e inicio del servidor
├── swagger.ts              # Configuración del swagger
├── config/
│   └── config.ts          # Configuración de variables de entorno (Mongo + puerto)
├── library/
│   └── Logging.ts         # Utilidad de logging con colores (INFO / WARN / ERROR)
├── middleware/
│   └── Joi.ts             # Validación de payloads con Joi + schemas de cada entidad
├── models/
│   ├── Organizacion.ts    # Esquema/Modelo Mongoose de Organizacion
│   └── Usuario.ts         # Esquema/Modelo Mongoose de Usuario
├── controllers/
│   ├── Organizacion.ts    # Lógica CRUD de Organizacion
│   └── Usuario.ts         # Lógica CRUD de Usuario
└── routes/
    ├── Organizacion.ts    # Definición de rutas de Organizacion
    └── Usuario.ts         # Definición de rutas de Usuario
```

---

## Descripción de cada archivo

### `src/server.ts`
Punto de entrada de la aplicación. Se encarga de:
1. Conectar a MongoDB mediante Mongoose.
2. Si la conexión es exitosa, inicia el servidor HTTP.
3. Registra middlewares globales: logging de peticiones/respuestas, CORS, body parsers.
4. Monta las rutas bajo los prefijos `/organizaciones` y `/usuarios`.
5. Expone un healthcheck en `GET /ping`.
6. Gestiona respuestas 404 para rutas no encontradas.

---

### `src/config/config.ts`
Lee las variables de entorno mediante `dotenv` y exporta el objeto `config` con dos secciones:
- `mongo.url` — URI de conexión a MongoDB.
- `server.port` — Puerto del servidor HTTP (por defecto `1337`).

---

### `src/library/Logging.ts`
Clase estática `Logging` con tres métodos de salida en consola, cada uno con un color diferente gracias a `chalk`:
| Método | Color | Uso |
|---|---|---|
| `Logging.info()` | Azul | Información general |
| `Logging.warning()` | Amarillo | Advertencias |
| `Logging.error()` | Rojo | Errores |

---

### `src/middleware/Joi.ts`
Contiene dos exportaciones:

- **`ValidateJoi(schema)`** — Middleware de orden superior que recibe un esquema Joi, valida el `req.body` y, si falla, devuelve `422 Unprocessable Entity`.
- **`Schemas`** — Objeto con los esquemas de validación de cada entidad:
  - `Schemas.organizacion.create` / `.update` → valida `{ name: string }`.
  - `Schemas.usuario.create` / `.update` → valida `{ name: string, email: string, password: string (min 6), organizacion: ObjectId (24 hex) }`.

---

### `src/models/Organizacion.ts`
Define el modelo Mongoose `Organizacion` con la siguiente estructura:

| Campo | Tipo | Requerido |
|---|---|---|
| `_id` | ObjectId | Sí (auto) |
| `name` | String | Sí |

Interfaces TypeScript exportadas: `IOrganizacion`, `IOrganizacionModel`.

---

### `src/models/Usuario.ts`
Define el modelo Mongoose `Usuario` con la siguiente estructura:

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `_id` | ObjectId | Sí (auto) | |
| `name` | String | Sí | |
| `email` | String | Sí | Único |
| `password` | String | Sí | |
| `organizacion` | ObjectId | Sí | Referencia a `Organizacion` |
| `createdAt` | Date | Auto | Generado por `timestamps: true` |
| `updatedAt` | Date | Auto | Generado por `timestamps: true` |

Interfaces TypeScript exportadas: `IUsuario`, `IUsuarioModel`.

---

### `src/services/Organizacion.ts` y `src/services/Usuario.ts`
Contienen la **lógica de negocio** y las llamadas directas a Mongoose. Es la capa encargada de interactuar con la persistencia de datos.


---

### `src/controllers/Organizacion.ts` y `src/controllers/Usuario.ts`
Gestionan el protocolo HTTP. Reciben los datos del `Request`, llaman a la capa de **Service** correspondiente y devuelven la respuesta en el `Response` con el código de estado adecuado. No conocen los detalles de implementación de la base de datos.

---

### `src/routes/Organizacion.ts` y `src/routes/Usuario.ts`
Registran los endpoints de cada recurso con sus middlewares de validación Joi correspondientes y delegan la lógica al controlador.

---

## Configuración de MongoDB

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
MONGO_URI="mongodb://localhost:27017/sem1"
SERVER_PORT="1337"
```

La variable crítica es `MONGO_URI`. La base de datos usada por defecto es **`sem1`**.

---

## Endpoints de la API

El servidor corre en `http://localhost:1337` por defecto. La documentación interactiva está disponible en `/api`.

### General

| Método | URL | Descripción |
|---|---|---|
| `GET` | `/ping` | Healthcheck — devuelve `{ "hello": "world" }` |

---

### Organizaciones — `/organizaciones`

| Método | URL | Body (JSON) | Validación | Descripción | Respuesta éxito |
|---|---|---|---|---|---|
| `POST` | `/` | `{ "name": "string" }` | Joi required | Crea una nueva organización | `201` |
| `GET` | `/` | — | — | Lista todas las organizaciones | `200` |
| `GET` | `/:organizacionId` | — | — | Obtiene una organización por ID | `200` |
| `PUT` | `/:organizacionId` | `{ "name": "string" }` | Joi required | Actualiza el nombre de una organización | `201` |
| `DELETE` | `/:organizacionId` | — | — | Elimina una organización por ID | `201` |

---

### Usuarios — `/usuarios`

| Método | URL | Body (JSON) | Validación | Descripción | Respuesta éxito |
|---|---|---|---|---|---|
| `POST` | `/` | `{ "name": string, "email": string, "password": password, "organizacion": "ObjectId" }` | Joi required | Crea un nuevo usuario | `201` |
| `GET` | `/` | — | — | Lista todos los usuarios | `200` |
| `GET` | `/:usuarioId` | — | — | Obtiene un usuario por ID (con populate de organización) | `200` |
| `PUT` | `/:usuarioId` | `{ "name": string, ... }` | Joi required | Actualiza los datos de un usuario | `201` |
| `DELETE` | `/:usuarioId` | — | — | Elimina un usuario por ID | `201` |

---

## 🎓 Ejercicio de Seminario

En la carpeta `ejercicio-seminario/` encontrarás material didáctico sobre cómo implementar relaciones entre modelos en Mongoose (Manual vs Virtuals). 

---

## Instalación y ejecución

```bash
# Instalar dependencias 
npm install

# Iniciar el servidor
npm start
```

Para compilar manualmente:
```bash
npx tsc
```

---

# 🧑‍💻 Ejercicio: Lista de Usuarios Conectados en el Chat

## 🎯 Objetivo
El objetivo de este ejercicio es implementar una nueva funcionalidad en nuestra aplicación de chat: **mostrar una lista en tiempo real de los usuarios que están actualmente conectados**. 

Al entrar a la sala de chat, el usuario deberá poder ver una barra lateral (o sección adyacente) con los nombres de todas las personas activas en ese momento. Esta lista debe actualizarse automáticamente cada vez que alguien entra o se va del chat.

---

## 🚀 Requisitos

1. **Backend (`C:\Users\Marc\Desktop\Uni\EA\BackendSeminario`):** 
   El servidor debe ser capaz de rastrear quién está conectado. Debe tener una vía para notificar a todos los clientes conectados cada vez que la lista de usuarios activos cambia (cuando se conecta un usuario nuevo o cuando alguien cierra la página).
2. **Frontend (`C:\Users\Marc\Desktop\Uni\EA\Chat_Seminario`):** 
   La aplicación en Angular debe tener un espacio en la vista del chat reservado para renderizar la lista. Debe escuchar las actualizaciones del servidor desde el servicio y reflejar los cambios en el componente de manera reactiva localmente en la pantalla del usuario.

---

## 🔍 Pistas y Guía de Resolución

### 🛠️ Pistas para el Backend (Directorio `EA_Sem7_JWT`)

*El manejo de WebSockets suele radicar allí donde inicializas Socket.io (generalmente en tu `server.ts` o en un controlador/servicio dedicado a Sockets).*

1. **Almacenamiento del Estado:** 
   Necesitas alguna estructura de datos local en tu servidor (como un `Array`, un `Map` o un `Set`) para guardar temporalmente a los usuarios activos. Piensa en qué información útil debes guardar (¿su ID? ¿su nombre de usuario?) y cómo asociarla al identificador único de su conexión, que suele ser su `socket.id`.
2. **Evento de Conexión / Mensaje Inicial:**
   En el lugar donde escuchas las conexiones entrantes (`io.on('connection', socket => { ... })`), cuando un usuario entra o envía su primer mensaje de configuración, añádelo a tu estructura de datos. Una vez añadido, usa métodos como `io.emit(...)` para avisar a **todos** los clientes de la nueva lista consolidada.
3. **Evento de Desconexión (`disconnect`):**
   Dentro de tu evento principal de conexión, debes escuchar también la desconexión individual usando `socket.on('disconnect', () => { ... })`. Aquí debes buscar al usuario en tu lista usando su `socket.id`, eliminarlo y volver a emitir a todos un evento de actualización con la nueva lista.

### 🎨 Pistas para el Frontend (Directorio `EA_Sem7_Socket/src/app`)

1. **El Servicio WebSockets (`services/chat.ts`):**
   Abre tu servicio encargado de la comunicación del chat. Al igual que debes de tener un método que escucha cuando entran nuevos mensajes, debes crear un nuevo método que escuche el evento emitido por el Backend de "lista de usuarios" (asegúrate de que el nombre del string del evento coincide en ambos lados). Este método debería retornar un flujo de datos (Observable o BehaviorSubject) para notificar al componente.
2. **Suscripción en el Componente (`components/chat/chat.ts`):**
   Ve a la lógica de TypeScript de tu componente de chat. Dentro del ciclo de vida (ej: `ngOnInit`), deberás suscribirte al nuevo método que acabas de crear en el servicio. Almacena la lista de usuarios conectadas que recibas en una propiedad local de tu clase, por ejemplo: `listaUsuariosConectados = []`.
3. **Pintar los usuarios en la Vista (HTML de chat):**
   Modifica la vista de tu componente de chat (posiblemente un archivo con terminación `.html` cercano a tu `.ts`, o la plantilla en línea). Utiliza la directiva de control de flujo propia de Angular (como `@for` o `*ngFor` dependiendo de tu versión) para iterar tu array `listaUsuariosConectados` e imprimir el nombre/información de esos usuarios en un bloque lateral.
   *Bonus: Aplica estilos CSS para que no interrumpa visualmente al chat principal.*

---

**¡Mucho ánimo y a programar!**

