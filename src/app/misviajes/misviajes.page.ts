import { Component, OnInit } from '@angular/core';
import { LatLng } from 'leaflet';
import { Viajes } from 'src/app/interfaces/viajes';
import { MapsService } from 'src/app/services/maps.service';
import { DatabaseService } from 'src/app/services/database.service'; // Asegúrate de importar el servicio de base de datos
import { AuthServiceService } from 'src/app/services/auth-service.service'; // Asegúrate de importar el servicio de autenticación

@Component({
  selector: 'app-misviajes',
  templateUrl: './misviajes.page.html',
  styleUrls: ['./misviajes.page.scss'],
})
export class MisviajesPage implements OnInit {
  viajes: Viajes[] = [];
  currentLocation: any;
  currentUserId: string = ''; // Para almacenar el ID del usuario actual

  constructor(private mapsService: MapsService, private databaseService: DatabaseService, private authService: AuthServiceService) {}

  ngOnInit() {
    this.authService.getUser().subscribe(usuario => {
      if (usuario) {
        this.currentUserId = usuario.uid; // Obtener el ID del usuario
        this.cargarViajes(); // Cargar viajes solo después de obtener el ID
      }
    });
    this.initCurrentLocation();
  }

  cargarViajes() {
    // Recuperar los viajes de Firestore
    this.databaseService.recuperarViajes().subscribe(viajes => {
      // Filtrar viajes para mostrar solo los del usuario actual
      this.viajes = viajes.filter(viaje => viaje.usuarioId === this.currentUserId);
      console.log('Viajes cargados desde Firestore para el usuario actual:', this.viajes); // Verifica que los viajes se están filtrando correctamente
      this.refreshMaps();
    }, error => {
      console.error('Error al cargar viajes de Firestore:', error);
    });
  }

  refreshMaps() {
    this.mapsService.refreshMaps(this.viajes, this.currentLocation);
  }

  async initCurrentLocation() {
    try {
      this.currentLocation = await this.mapsService.getCurrentLocation();
      this.mapsService.refreshMaps(this.viajes, this.currentLocation);
    } catch (error) {
      console.error('Error al obtener la geolocalización:', error);
    }
  }

  eliminarViaje(id: number) {
    // Eliminar el viaje de Firestore
    this.databaseService.eliminarViaje(id).then(() => {
      console.log('Viaje eliminado de Firestore:', id);
      // Volver a cargar los viajes para reflejar los cambios en la UI
      this.cargarViajes();
    }).catch(error => {
      console.error('Error al eliminar el viaje:', error);
    });
  }
}
