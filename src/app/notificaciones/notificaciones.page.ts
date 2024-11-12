import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, Subscription } from 'rxjs';
import { AuthServiceService } from '../services/auth-service.service';
import { DatabaseService } from '../services/database.service';

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

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthServiceService,
    private firebaseStorage : DatabaseService
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
      ref.where('usuarioId', '==',this.usuarioId) // Si deseas filtrar por el tipo de notificación (opcional)
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
  

  eliminarNotificacion(notificationId: string) {
    if (!notificationId) {
      console.error('Notification ID is required');
      return;
    }
    this.firebaseStorage.eliminarNotificaciones(notificationId)
      .then(() => {
        console.log('Notificación eliminada de Firestore:', notificationId);
      })
      .catch(error => {
        console.error('Error al eliminar notificación:', error);
      });
  }
  

  ngOnDestroy() {
    // Limpiar suscripción para evitar pérdidas de memoria
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}
