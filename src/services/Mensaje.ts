import { Server as SocketIOServer, Socket } from 'socket.io';
import Logging from '../library/Logging';
import MensajeModel, { IMensajeModel } from '../models/Mensaje';

interface UsuarioConectado {
    socketId: string;
    usuarioId: string;
    nombre: string;
    organizacionId: string;
}

export class MensajeService {
    private io: SocketIOServer;
    private usuariosConectados: Map<string, UsuarioConectado> = new Map();

    constructor(io: SocketIOServer) {
        this.io = io;
    }

    public inicializarSockets(): void {
        this.io.on('connection', (socket: Socket) => {
            Logging.info(`Socket conectado: ${socket.id}`);

            socket.on('join-organization', (organizacionId: string) => {
                if (!organizacionId) return;
                socket.join(`org-${organizacionId}`);
            });

            socket.on('user-connected', (data: { usuarioId: string; nombre: string; organizacionId: string }) => {
                if (!data?.usuarioId || !data?.nombre || !data?.organizacionId) return;

                this.usuariosConectados.set(socket.id, {
                    socketId: socket.id,
                    usuarioId: data.usuarioId,
                    nombre: data.nombre,
                    organizacionId: data.organizacionId
                });

                Logging.info(`Usuario conectado: ${data.nombre}`);
                this.emitirUsuariosConectados(data.organizacionId);
            });

            socket.on('typing', (data: { usuario: string; organizacionId: string }) => {
                Logging.info(`${data.usuario} está escribiendo...`);
                socket.to(`org-${data.organizacionId}`).emit('user-typing', data);
            });

            socket.on('stop-typing', (data: { usuario: string; organizacionId: string }) => {
                Logging.info(`${data.usuario} dejó de escribir`);
                socket.to(`org-${data.organizacionId}`).emit('user-stop-typing', data);
            });

            socket.on('message', async (data: { usuario: string; organizacion: string; contenido: string }) => {
                try {
                    Logging.info(`Mensaje recibido de ${data.usuario}`);

                    const nuevoMensaje = await this.guardarMensaje(
                        data.contenido,
                        data.usuario,
                        data.organizacion
                    );

                    this.io.to(`org-${data.organizacion}`).emit('message', nuevoMensaje);
                } catch (error) {
                    Logging.error(`Error al guardar mensaje: ${error}`);
                    socket.emit('error', { message: 'Error al guardar el mensaje' });
                }
            });

            socket.on('mark-as-read', async (mensajeId: string) => {
                try {
                    await MensajeModel.findByIdAndUpdate(mensajeId, { leido: true });
                    Logging.info(`Mensaje ${mensajeId} marcado como leído`);
                } catch (error) {
                    Logging.error(`Error al marcar mensaje como leído: ${error}`);
                }
            });

            socket.on('disconnect', () => {
                const usuarioDesconectado = this.usuariosConectados.get(socket.id);

                if (usuarioDesconectado) {
                    this.usuariosConectados.delete(socket.id);
                    this.emitirUsuariosConectados(usuarioDesconectado.organizacionId);
                }

                Logging.info(`Socket desconectado: ${socket.id}`);
            });
        });
    }

    private emitirUsuariosConectados(organizacionId: string): void {
        const lista = Array.from(this.usuariosConectados.values())
            .filter((usuario) => usuario.organizacionId === organizacionId)
            .map(({ socketId, usuarioId, nombre, organizacionId }) => ({
                socketId,
                usuarioId,
                nombre,
                organizacionId
            }));

        this.io.to(`org-${organizacionId}`).emit('connected-users', lista);
    }

    public async guardarMensaje(
        contenido: string,
        usuarioId: string,
        organizacionId: string
    ): Promise<IMensajeModel> {
        const mensaje = new MensajeModel({
            contenido,
            usuario: usuarioId,
            organizacion: organizacionId,
            leido: false
        });

        const savedMensaje = await mensaje.save();
        return await savedMensaje.populate('usuario', 'name email');
    }

    public async obtenerMensajesPorOrganizacion(organizacionId: string): Promise<IMensajeModel[]> {
        return await MensajeModel.find({ organizacion: organizacionId })
            .populate('usuario', 'name email')
            .sort({ createdAt: -1 });
    }

    public async obtenerMensajesNoLeidos(usuarioId: string): Promise<IMensajeModel[]> {
        return await MensajeModel.find({ usuario: usuarioId, leido: false })
            .populate('usuario', 'name email')
            .populate('organizacion', 'name');
    }
}