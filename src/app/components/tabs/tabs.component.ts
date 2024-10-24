import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent  implements OnInit {
  tieneVehiculo = true;
  usuario: any;

  

  constructor(
    private authService: AuthServiceService,
    private databaseService: DatabaseService,
  ) { }

  ngOnInit() {
    this.verificarVehiculo();
    this.usuario = {
      vehiculo: false
    };
  }


  verificarVehiculo() {
    this.authService.getUser().subscribe(usuario => {
      if (usuario) {
        const usuarioId = usuario.uid; // ID del usuario autenticado
  
        // Recupera la lista de usuarios
        this.databaseService.recuperarUsuarios().subscribe((usuarios: Usuario[]) => {
          // Filtra para encontrar el usuario actual
          const usuarioActual = usuarios.find(u => u.idUser === usuarioId);
  
          if (usuarioActual) {
            // Verifica si el usuario tiene vehículo
            if (usuarioActual.vehiculo) {
              console.log('El usuario tiene vehículo habilitado:', usuarioActual.vehiculo);
              this.usuario.vehiculo = true;
            } else {
              console.log('El usuario no tiene vehículo habilitado.');
              this.usuario.vehiculo = false;
            }
          } else {
            console.log('No se encontró el usuario actual.');
            this.usuario.vehiculo = false;
          }
        }, error => {
          console.error('Error al recuperar usuarios:', error);
        });
      } else {
        console.log('No hay usuario autenticado');
      }
    });
  }
  
}
