import { Component, OnInit, AfterViewInit  } from '@angular/core';
import { Viajes } from '../interfaces/viajes';
import { LoadingController } from '@ionic/angular';

import { MapsService } from '../services/maps.service'; // Servicio creado exclusivamente para el mapa
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-conductor',
  templateUrl: './conductor.page.html',
  styleUrls: ['./conductor.page.scss'],
})
export class ConductorPage implements OnInit {
  tieneVehiculo: boolean = false;

  vje:Viajes={
    id: Date.now(),
    destino: "",
    capacidad: 0,
    costo: 0,
    horaSalida: ""
  };
  viajes: Viajes[] = [];
  currentLocation: any;

  constructor(
    private mapsService: MapsService,
    private loadingController: LoadingController,
    private authService: AuthServiceService
  ) {}

  ngOnInit() {
    this.verificarVehiculo();
    console.log("verificar", this.verificarVehiculo())
    this.cargarViajes()
  }

  async ngAfterViewInit() {
    this.currentLocation = await this.mapsService.getCurrentLocation();
    this.mapsService.refreshMaps(this.viajes, this.currentLocation);
  }

  async initCurrentLocation() {
    try {
      this.currentLocation = await this.mapsService.getCurrentLocation();
      console.log('Geolocalización disponible.', this.currentLocation);
    } catch (error) {
      console.error('Error al obtener la geolocalización:', error);
    }
  }

  async programarViaje() {
    const loading = await this.loadingController.create({
      message: 'Creando dirección...',
    });
    await loading.present();

    const StorageViajes = localStorage.getItem('viajes');
    let viajes: Viajes[] = StorageViajes ? JSON.parse(StorageViajes) : [];

    this.vje.id = Date.now();

    try {
      const location = await this.mapsService.getLatLngFromAddress(this.vje.destino);
      this.vje.lat = location.lat;
      this.vje.lng = location.lng;

      viajes.unshift(this.vje);
      localStorage.setItem('viajes', JSON.stringify(viajes));
      console.log('Viaje guardado:', this.vje)

      this.vje = {
        id: Date.now(),
        destino: "",
        capacidad: 0,
        costo: 0,
        horaSalida: ""
      };
      this.cargarViajes();
      this.mapsService.refreshMaps(this.viajes, this.currentLocation); // Refresca los mapas
    } catch (error) {
      console.error('Error al crear la dirección:', error);
    } finally {
      await loading.dismiss();
    }
  }

  cargarViajes() {
    const StorageViajes = localStorage.getItem('viajes');
    if (StorageViajes) {
      this.viajes = JSON.parse(StorageViajes);
    } else {
      console.log('No hay viajes disponibles.');
    }
  }

  eliminarViaje(id: number) {
    const StorageViajes = localStorage.getItem('viajes');
    let viajes: Viajes[] = StorageViajes ? JSON.parse(StorageViajes) : [];

    document.getElementById(`card-${id}`)?.classList.add('removing'); // Añadir clase para la animación


    viajes = viajes.filter(viaje => viaje.id !== id);

    localStorage.setItem('viajes', JSON.stringify(viajes));

    console.log(`Viaje con ID ${id} eliminado.`);
    this.cargarViajes();
    this.mapsService.refreshMaps(this.viajes, this.currentLocation); // Refresca los mapas
  }

  initMaps() {
    this.viajes.forEach((viaje) => {
      if (viaje.lat !== undefined && viaje.lng !== undefined) {
        const mapId = `map-${viaje.id}`;
        const mapContainer = document.getElementById(mapId);
        if (mapContainer) {
          const map = this.mapsService.initMap(mapId, viaje.lat, viaje.lng);
          this.mapsService.addMarker(map, viaje.lat, viaje.lng);

          if (this.currentLocation) {
            this.mapsService.addMarker(map, this.currentLocation.lat, this.currentLocation.lng);
            this.mapsService.drawRoute(map, this.currentLocation.lat, this.currentLocation.lng, viaje.lat, viaje.lng);
          }
        } else {
          console.warn(`El contenedor del mapa ${mapId} no está disponible.`);
        }
      }
    });
  }

  verificarVehiculo() {
    this.authService.getUser().subscribe(usuario => {
      if (usuario) {
        this.authService.getUserVehicle(usuario.uid).subscribe(vehiculo => {
          this.tieneVehiculo = !!vehiculo; 
          if (!this.tieneVehiculo) {
            console.log("El usuario no tiene vehículo habilitado.");
          }
        });
      }
    });
  }

}
