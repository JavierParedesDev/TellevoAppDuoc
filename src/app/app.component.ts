import { Component, OnInit } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private platform: Platform
  ) {
    this.showSplash();
  }

  ngOnInit() {
    this.platform.ready().then(() => {
      document.body.classList.remove('dark');  // Elimina el modo oscuro si está activo
      document.body.classList.add('light');    // Fuerza el modo claro
    });
  }

  async showSplash(){
    await SplashScreen.show({
      autoHide: true,
      showDuration: 2000,
    });
  }
}
