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

  reservarAsiento(viaje: Viajes , id :number, capacidad : number ) {
    console.log(viaje);
    this.alertas("Asiento Reservado", "Su destino es: " + viaje.destino);
    this.reserva = true;
    this.EliminarReserva = false;
    // nota: me falta verificar los viajes en 0 y poner condicion
    const nueva_capacidad = capacidad - 1;
    console.log(capacidad);
    return this.firestore.collection('viajes').doc(id.toString()).update({capacidad : nueva_capacidad})
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
