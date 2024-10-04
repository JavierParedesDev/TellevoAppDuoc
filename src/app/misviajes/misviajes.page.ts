import { Component, OnInit } from '@angular/core';
import { LatLng } from 'leaflet';
import { Viajes } from 'src/app/interfaces/viajes';
import { MapsService } from 'src/app/services/maps.service';

@Component({
  selector: 'app-misviajes',
  templateUrl: './misviajes.page.html',
  styleUrls: ['./misviajes.page.scss'],
})
export class MisviajesPage implements OnInit {
  viajes: Viajes[] = [];
  currentLocation: any;

  constructor(private mapsService: MapsService) {}

  ngOnInit() {
    this.cargarViajes();
    this.initCurrentLocation();
  }

  cargarViajes() {
  const StorageViajes = localStorage.getItem('viajes');
  if (StorageViajes) {
    this.viajes = JSON.parse(StorageViajes);
    console.log('Viajes cargados:', this.viajes); // Verifica que los viajes se están cargando correctamente
  } else {
    console.log('No hay viajes disponibles.');
  }
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
    const StorageViajes = localStorage.getItem('viajes');
    let viajes: Viajes[] = StorageViajes ? JSON.parse(StorageViajes) : [];

    // Filtrar el viaje que se va a eliminar
    viajes = viajes.filter(viaje => viaje.id !== id);

    // Guardar los viajes restantes en localStorage
    localStorage.setItem('viajes', JSON.stringify(viajes));

    // Volver a cargar los viajes para reflejar los cambios en la UI
    this.cargarViajes();
  }

  
  
}
