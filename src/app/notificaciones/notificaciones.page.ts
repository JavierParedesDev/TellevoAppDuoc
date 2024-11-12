import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';
import { AuthServiceService } from '../services/auth-service.service';
import { DatabaseService } from '../services/database.service';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
})
export class NotificacionesPage implements OnInit, OnDestroy {
  usuarioId: string = ''; // ID del usuario actual
  notificaciones$: Observable<any[]> | undefined;
  viajes$: Observable<any[]> | undefined;
  userSubscription: Subscription | undefined;
  currentUserId: string = ""; 

  //chat
  currentUserName= "";
  chatId: string = 'chatTellevo'; 
  messages: any[] = [];
  newMessage: string = '';
  private messagesSubscription: Subscription | undefined;

  isModalOpen = false;

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthServiceService,
    private firebaseStorage : DatabaseService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.userSubscription = this.authService.getUser().subscribe(user => {
      if (user) {
        this.usuarioId = user.uid;
        console.log("Usuario ID:", this.usuarioId); // Verificar si el usuarioId está siendo asignado correctamente
        this.cargarViajesYNotificaciones(); // Cargar los datos una vez se tiene el usuarioId
      } else {
        console.log("Usuario no autenticado");
      }
    });
    console.log("notificacion",this.cargarViajesYNotificaciones());

    this.authService.getUser().subscribe({
      next: (usuario) => {
        if (usuario) {
          this.currentUserId = usuario.uid; // Obtener ID de usuario
        }
      },
      error: (error) => {
        console.error('Error al obtener el usuario:', error);
      },
    });

    //chat
    this.messagesSubscription = this.firebaseStorage.getMessages(this.chatId)
    .subscribe(messages => {
      this.messages = messages;
    });

    this.firebaseStorage.obtenerNombreUsuarioActual().subscribe({
      next: (nombre) => {
        this.currentUserName = nombre;
        console.log('Nombre del usuario:', this.currentUserName);
      },
      error: (error) => {
        console.error('Error al obtener el nombre del usuario:', error);
      },
    });
    
  }

  cargarViajesYNotificaciones() {
    console.log("Cargando viajes y notificaciones...");
  
    // Consultar los viajes futuros creados por el usuario actual
    this.viajes$ = this.firestore.collection('viajes', ref => 
      ref.where('usuarioId', '==', this.usuarioId)
         .where('fecha', '>=', new Date())
         .orderBy('fecha')
    ).valueChanges();
  
    // Consultar las notificaciones relevantes para el usuario actual
    this.notificaciones$ = this.firestore.collection('notificaciones', ref => 
      ref.where('usuarioId', '==', this.usuarioId) // Filtrar notificaciones del usuario actual
         .orderBy('fecha', 'desc')
    ).valueChanges();
  
    // Suscripción a notificaciones con log para verificar si se reciben datos
    this.notificaciones$.subscribe(data => {
      if (data.length === 0) {
        console.log("No se encontraron notificaciones.");
      } else {
        console.log("Notificaciones recibidas:", data);
      }
    });
  }

  

  eliminarNotificacion(viajeId: string) {
    this.firestore.collection("notificaciones", ref => 
      ref.where("viajeId", "==", viajeId)
    ).get().subscribe(snapshot => {
      if (snapshot.empty) {
        console.log("No se encontraron notificaciones para eliminar.");
        return;
      }
      
      snapshot.forEach(doc => {
        doc.ref.delete().then(() => {
          console.log("Notificación de reserva eliminada.");
        }).catch(error => {
          console.error("Error al eliminar la notificación de reserva:", error);
        });
      });
    });
  }
  
  
  //chat

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  sendMessage() {
    if (this.newMessage.trim() !== '') {
      const message = {
        sender:this.currentUserName, // ID del usuario que envía el mensaje
        content: this.newMessage,
        timestamp: new Date().getTime() // Timestamp en formato Unix
      };

      // Llamar al servicio para enviar el mensaje
      this.firebaseStorage.sendMessage(this.chatId, message)
        .then(() => {
          this.newMessage = ''; // Limpiar el campo de texto después de enviar el mensaje
        })
        .catch(error => console.error('Error al enviar el mensaje:', error));
    }
  }

  ngOnDestroy() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
  }
}
