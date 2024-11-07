import { Component, OnInit } from '@angular/core';
import { Viajes } from '../interfaces/viajes';
import { AlertController } from '@ionic/angular';
import { AngularFirestore, docChanges } from '@angular/fire/compat/firestore';
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-pasajero',
  templateUrl: './pasajero.page.html',
  styleUrls: ['./pasajero.page.scss'],
})
export class PasajeroPage implements OnInit {
  viajes: Viajes[] = [];
  reserva: boolean = false;
  EliminarReserva: boolean = true;
  currentUserId: string = ''; // Inicialmente vacío

  constructor(private alert: AlertController, private firestore: AngularFirestore, private authService: AuthServiceService) {}

  ngOnInit() {
    // Obtener el ID del usuario actual
    this.authService.getUser().subscribe(usuario => {
      if (usuario) {
        this.currentUserId = usuario.uid; // Obtener el ID del usuario
        this.cargarViajes(); // Cargar viajes una vez que se tenga el ID del usuario
      }
    });
  }

  cargarViajes() {
    // Obtener viajes de Firebase
    console.log(this.currentUserId);
    this.firestore.collection<Viajes>('viajes').valueChanges().subscribe(viajes => {
      // Filtrar viajes que no pertenecen al usuario actual
      this.viajes = viajes.filter(viaje => viaje.usuarioId !== this.currentUserId);
      if (this.viajes.length === 0) {
        console.log('No hay viajes de otros usuarios disponibles.');
      } else {
        console.log('Viajes de otros usuarios disponibles:', this.viajes);
      }
     
    });
  }

  reservarAsiento(viaje: Viajes, id: number, capacidad: number, usuarioId: string) {
    console.log(viaje);
  
    // Mostrar una alerta de reserva exitosa
    this.alertas("Asiento Reservado", "Su destino es: " + viaje.destino);
    this.reserva = true;
    this.EliminarReserva = false;
  
    // Calcular la nueva capacidad
    const nueva_capacidad = capacidad - 1;
    console.log("Capacidad restante:", nueva_capacidad);
  
    // 1. Actualizar la capacidad en Firestore
    this.firestore.collection('viajes').doc(id.toString()).update({ capacidad: nueva_capacidad })
      .then(() => {
        // 2. Agregar la notificación a la colección de notificaciones del usuario
        const notificacion = {
          tipo: 'Reserva Asiento', // Tipo de notificación
          mensaje: `Has reservado un asiento para el viaje a ${viaje.destino}.`, // Mensaje
          fecha: new Date(), // Fecha y hora de la notificación
          leido: false, // Notificación no leída inicialmente
          usuarioId: usuarioId, // El ID del usuario que hizo la reserva
          viajeId: id // ID del viaje asociado a la notificación
        };
  
        // 3. Guardar la notificación en Firestore
        return this.firestore.collection('notificaciones').add(notificacion);
      })
      .then(() => {
        console.log("Notificación agregada correctamente.");
      })
      .catch((error) => {
        console.error("Error al actualizar la capacidad o agregar la notificación: ", error);
      });
  }
  

  eliminarReserva(id:number , capacidad: number) {
    this.EliminarReserva = true;
    this.reserva = false;
    const nueva_capacidad = capacidad + 1;
    
    return this.firestore.collection('viajes').doc(id.toString()).update({capacidad : nueva_capacidad})
  }

  async alertas(headerMensaje: string, mensaje: string) {
    const newAlerta = await this.alert.create({
      header: headerMensaje,
      message: mensaje,
      buttons: ['Aceptar']
    });

    newAlerta.present();
  }
}
