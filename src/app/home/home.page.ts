import { Component, OnInit } from '@angular/core';
import { AuthServiceService } from '../services/auth-service.service';
import { DatabaseService } from '../services/database.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  email: any;
  currentUserName: string = "";
  viajesTerminados: any[] = [];
  ganancias: any[] = [];


  constructor(
    private authServi: AuthServiceService,
    private databaseService : DatabaseService
  ) {}
  ngOnInit() {
    this.authServi.getUser().subscribe(user => {
      this.email = user?.email;
      console.log(user)
      this.cargarHistorialViajes()
    })
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

  cargarHistorialViajes(): void {
    const viajescount = localStorage.getItem('viajesTerminados');
    const ganancias = localStorage.getItem('ganancias');
    if (viajescount) {
      this.viajesTerminados = JSON.parse(viajescount);
      this.ganancias = JSON.parse(ganancias);
      console.log('Historial de viajes:', this.viajesTerminados);
    } else {
      console.log('No hay historial de viajes en localStorage.');
    }
  }
  handleRefresh(event) {
    setTimeout(() => {
      window.location.reload(); 
      event.target.complete();
    }, 300);
  }


  

}
