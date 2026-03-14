
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

