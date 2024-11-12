import { Component, OnInit } from "@angular/core";
import { Viajes } from "../interfaces/viajes";
import { AlertController } from "@ionic/angular";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { AuthServiceService } from "../services/auth-service.service";
import { DatabaseService } from "../services/database.service";
import { MapsService } from "../services/maps.service";

@Component({
  selector: "app-pasajero",
  templateUrl: "./pasajero.page.html",
  styleUrls: ["./pasajero.page.scss"],
})
export class PasajeroPage implements OnInit {
  viajes: Viajes[] = [];
  reserva: boolean = false;
  EliminarReserva: boolean = true;
  currentUserId: string = ""; // ID del usuario que reserva
  currentUserName: string = ""; // Nombre del usuario actual
  currentLocation: any;

  constructor(
    private alert: AlertController,
    private firestore: AngularFirestore,
    private databaseService: DatabaseService,
    private mapsService: MapsService,
    private authService: AuthServiceService // Servicio de autenticación
  ) {}

  ngOnInit() {
    // Obtener el ID y nombre del usuario autenticado
    this.authService.getUser().subscribe({
      next: (usuario) => {
        if (usuario) {
          this.currentUserId = usuario.uid; // Obtener ID de usuario
          this.currentUserName = ""; // Obtener nombre
          this.cargarViajes(); // Cargar viajes solo después de obtener el ID y nombre del usuario
        }
      },
      error: (error) => {
        console.error('Error al obtener el usuario:', error);
      },
    });
    this.initCurrentLocation();

    this.databaseService.obtenerNombreUsuarioActual().subscribe({
      next: (nombre) => {
        this.currentUserName = nombre;
        console.log('Nombre del usuario:', this.currentUserName);
      },
      error: (error) => {
        console.error('Error al obtener el nombre del usuario:', error);
      },
    });
  }

  cargarViajes() {
    // Obtener viajes de Firebase
    this.firestore
      .collection<Viajes>("viajes")
      .valueChanges()
      .subscribe((viajes) => {
        // Filtrar los viajes que no pertenecen al usuario actual
        this.viajes = viajes.filter(
          (viaje) => viaje.usuarioId !== this.currentUserId
        );
        this.refreshMaps()
      });
  }

  refreshMaps() {
    // Actualizar mapas con los viajes y la ubicación actual
    this.mapsService.refreshMaps(this.viajes, this.currentLocation);
  }

  async initCurrentLocation() {
    try {
      // Obtener la ubicación actual del usuario
      this.currentLocation = await this.mapsService.getCurrentLocation();
      this.mapsService.refreshMaps(this.viajes, this.currentLocation);
    } catch (error) {
      console.error("Error al obtener la geolocalización:", error);
    }
  }

  reservarAsiento(
    viaje: Viajes,
    viajeId: string,
    capacidad: number,
    creadorId: string
  ) {
    // Verificar si hay asientos disponibles
    if (capacidad <= 0) {
      this.alertas("Error", "No hay asientos disponibles.");
      return;
    }

    // Verificar si el nombre del usuario está disponible
    if (!this.currentUserName) {
      this.alertas("Error", "No se ha encontrado el nombre del usuario.");
      return;
    }

    // Mostrar alerta de reserva exitosa
    this.alertas("Asiento Reservado", "Su destino es: " + viaje.destino);
    this.reserva = true;
    this.EliminarReserva = false;

    // Calcular la nueva capacidad
    const nueva_capacidad = capacidad - 1;

    // 1. Actualizar la capacidad en Firestore
    this.firestore
      .collection("viajes")
      .doc(viajeId)
      .update({ capacidad: nueva_capacidad })
      .then(() => {
        console.log("Capacidad actualizada correctamente.");

        // 2. Crear la notificación
        const notificacion = {
          notificationId: Date.now().toString(),
          tipo: "Reserva Asiento", // Tipo de notificación
          mensaje: `El usuario ${this.currentUserName} ha reservado un asiento para el viaje a ${viaje.destino}.`,
          fecha: new Date(), // Fecha y hora de la notificación
          leido: false, // Notificación no leída inicialmente
          usuarioId: creadorId, // ID del creador del viaje (esto debe ser el ID del usuario que creó el viaje)
          reservaUsuarioId: this.currentUserId, // ID del usuario que hizo la reserva
          viajeId: viajeId, // ID del viaje asociado
          creadorId: viaje.usuarioId, // El ID del creador del viaje
        };

        // 3. Guardar la notificación en Firestore
        return this.firestore.collection("notificaciones").add(notificacion);
      })
      .then(() => {
        console.log("Notificación agregada correctamente.");
      })
      .catch((error) => {
        console.error(
          "Error al actualizar la capacidad o agregar la notificación: ",
          error
        );
      });
  }

  eliminarReserva(viajeId: string, capacidad: number, creadorId: string) {
    this.EliminarReserva = true;
    this.reserva = false;
  
    const nueva_capacidad = capacidad + 1;
  
    // 1. Update the trip capacity in Firestore
    this.firestore
      .collection("viajes")
      .doc(viajeId)
      .update({ capacidad: nueva_capacidad })
      .then(() => {
        console.log("Reserva eliminada y capacidad actualizada.");
  
        // 2. Find and delete the original reservation notification
        this.firestore.collection("notificaciones", ref => 
          ref.where("viajeId", "==", viajeId)
             .where("reservaUsuarioId", "==", this.currentUserId)
             .where("tipo", "==", "Reserva Asiento")
        ).get().subscribe(snapshot => {
          snapshot.forEach(doc => {
            doc.ref.delete().then(() => {
              console.log("Notificación de reserva eliminada.");
            }).catch(error => {
              console.error("Error al eliminar la notificación de reserva:", error);
            });
          });
        });
  
        // 3. Create a new cancellation notification for the trip creator
        const cancelNotification = {
          notificationId: Date.now().toString(),
          tipo: "Cancelación Reserva", 
          mensaje: `El usuario ${this.currentUserName} ha cancelado su reserva para el viaje a ${viajeId}.`,
          fecha: new Date(),
          leido: false,
          usuarioId: creadorId,  // ID of the trip creator
          reservaUsuarioId: this.currentUserId,  // ID of the user canceling
          viajeId: viajeId
        };
  
        // 4. Add the cancellation notification to Firestore
        return this.firestore.collection("notificaciones").add(cancelNotification);
      })
      .then(() => {
        console.log("Notificación de cancelación agregada correctamente.");
      })
      .catch(error => {
        console.error("Error al eliminar la reserva o crear la notificación de cancelación:", error);
      });
  }
  
  

  async alertas(headerMensaje: string, mensaje: string) {
    const newAlerta = await this.alert.create({
      header: headerMensaje,
      message: mensaje,
      buttons: ["Aceptar"],
    });

    newAlerta.present();
  }
}
