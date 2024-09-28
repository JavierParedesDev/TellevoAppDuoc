import { Component, OnInit } from '@angular/core';
import { Viajes } from '../interfaces/viajes';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-pasajero',
  templateUrl: './pasajero.page.html',
  styleUrls: ['./pasajero.page.scss'],
})
export class PasajeroPage implements OnInit {
  viajes: Viajes[]= [];
  private intervalo : any;

  reserva : boolean = false;
  EliminarReserva : boolean = true;
 
  constructor(

    private alert : AlertController

  ) { }

  ngOnInit() {
    this.intervalo = setInterval(() =>{
      this.cargarViajes();
    },1000)
  }
  cargarViajes() {
    const StorageViajes = localStorage.getItem('viajes');
    if (StorageViajes) {
      this.viajes = JSON.parse(StorageViajes);
    } else {
      console.log('No hay viajes disponibles.');
    }
    
  }

  reservarAsiento(viajes : Viajes, id: number) {
    console.log(viajes, id);
    this.alertas("Asiento Reservado","su destino es : "+ viajes.destino)
    this.reserva = true
    this.EliminarReserva = false
    
  }
  eliminarReserva(){
    this.EliminarReserva = true
    this.reserva = false

  }

  async alertas(headerMensasje: string , mensaje: string){
    const newAlerta = await this.alert.create({
      header: headerMensasje,
      message: mensaje,

      buttons: [ 'Aceptar' ]
    })

    newAlerta.present();
    
  }


}
