import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
})
export class NotificacionesPage implements OnInit {

  usuarioId: string = 'id_del_usuario'; // Asegúrate de obtener el ID del usuario actual de alguna manera (auth, storage, etc.)
  notificaciones$: Observable<any[]> | undefined;
  viajes$: Observable<unknown[]> | undefined;

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    // 1. Consultar los viajes futuros a Madrid
    this.viajes$ = this.firestore.collection('viajes', ref => 
      ref.where('usuarioId', '==', '#')
         .where('fecha', '>=', new Date())
         .orderBy('destino')
         .orderBy('fecha')
    ).valueChanges();
  
    // 2. Suscribirse a las notificaciones del usuario
    this.notificaciones$ = this.firestore.collection('notificaciones').valueChanges();
  }

  // Opcional: Puedes agregar una función para marcar las notificaciones como leídas
  marcarComoLeida(notificacionId: string) {
    this.firestore.collection('notificaciones').doc(notificacionId).update({
      leido: true
    });
  }

}
