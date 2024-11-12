import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Viajes } from '../interfaces/viajes';
import { AuthServiceService } from './auth-service.service';
import { Usuario } from '../interfaces/usuario';
import { Vehiculo } from '../interfaces/vehiculo';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  usuarios: Usuario[] = [];

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthServiceService,
    private db: AngularFireDatabase
  ) { }

  recuperarUsuarios(): Observable<any[]> {
    return this.firestore.collection('usuarios').valueChanges();
  }
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.firestore
      .collection<Usuario>('usuarios')  // Suponiendo que la colección se llama 'usuarios'
      .valueChanges();  // Obtiene los usuarios como un array
  }
  obtenerNombreUsuarioActual(): Observable<string> {
    return new Observable<string>((observer) => {
      // Obtener el ID del usuario actual desde el AuthService
      this.authService.getUser().subscribe((usuario) => {
        if (usuario) {
          const currentUserId = usuario.uid;
          
          // Recuperamos todos los usuarios
          this.obtenerUsuarios().subscribe((usuarios) => {
            // Buscar el usuario actual por el ID
            const usuarioEncontrado = usuarios.find(
              (usuario) => usuario.idUser === currentUserId
            );

            if (usuarioEncontrado) {
              observer.next(usuarioEncontrado.nombre);  // Si se encuentra el usuario, emitimos su nombre
            } else {
              observer.next('Usuario no encontrado');  // Si no se encuentra, emitimos un mensaje por defecto
            }
          });
        } else {
          observer.next('Usuario no autenticado');  // Si no hay usuario autenticado
        }
      });
    });
  }

  obtenerUsuarioPorId(id: string): Promise<Usuario | undefined> {
    return this.firestore
      .collection('usuarios')
      .doc(id)
      .get()
      .toPromise()
      .then((doc) => {
        // Verificamos si el documento existe
        if (doc && doc.exists) {
          return doc.data() as Usuario; // Retorna los datos del usuario si el documento existe
        } else {
          return undefined; // Si el documento no existe, retornamos undefined
        }
      })
      .catch((error) => {
        console.error('Error al obtener el usuario:', error);
        return undefined; // Si ocurre algún error, retornamos undefined
      });
  }

  agregarViaje(viaje: any): Promise<void> {
    const viajeId = this.firestore.createId(); 
    return this.firestore.collection('viajes').doc(viajeId).set({ ...viaje, id: viajeId });
  }
  
  recuperarViajes(): Observable<Viajes[]> {
    return this.firestore.collection<Viajes>('viajes').valueChanges();
  }
  eliminarViaje(id: number): Promise<void> {
    return this.firestore.collection('viajes').doc(id.toString()).delete();
  }

  obtenerVehiculoUsuario(usuarioId: string): Observable<Vehiculo | null> {
    console.log(usuarioId)
    console.log("usuarios", this.recuperarUsuarios())
    return this.firestore.collection('usuarios').doc(usuarioId).valueChanges().pipe(
      map((usuario: any) => usuario && usuario.vehiculo ? usuario.vehiculo: null)
    );
  }

  eliminarNotificaciones(notificationId: string): Promise<void> {
    return this.firestore.collection('notificaciones').doc(notificationId).delete();
  }

  //chat


  // Obtener todos los mensajes (en un chat, por ejemplo)
  getMessages(chatId: string): Observable<any[]> {
    return this.db.list(`chats/${chatId}/messages`).valueChanges();
  }

  // Enviar un mensaje
  sendMessage(chatId: string, message: any) {
    const messagesRef = this.db.list(`chats/${chatId}/messages`);
    return messagesRef.push(message); // Push agrega un mensaje al final
  }

  // Eliminar un mensaje (por ejemplo, dado un mensajeId)
  deleteMessage(chatId: string, messageId: string) {
    return this.db.list(`chats/${chatId}/messages`).remove(messageId);
  }
  

  
}
