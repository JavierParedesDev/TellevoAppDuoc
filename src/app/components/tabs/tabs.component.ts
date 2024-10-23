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
  userId: string | null = null;
  usuarioId: string | null = null;

  constructor(
    private authService: AuthServiceService,
    private databaseService: DatabaseService,
  ) { }

  ngOnInit() {
    this.verificarVehiculo();
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
              this.tieneVehiculo = false;
            } else {
              console.log('El usuario no tiene vehículo habilitado.');
              this.tieneVehiculo = true;
            }
          } else {
            console.log('No se encontró el usuario actual.');
            this.tieneVehiculo = true; // Asumimos que no tiene vehículo si no se encuentra
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
