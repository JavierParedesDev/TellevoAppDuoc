import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './components/tabs/tabs.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'tabs',
    component: TabsComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'conductor',
        loadChildren: () => import('./conductor/conductor.module').then(m => m.ConductorPageModule)
      },
      {
        path: 'pasajero',
        loadChildren: () => import('./pasajero/pasajero.module').then(m => m.PasajeroPageModule)
      },
      {
        path: '',
        redirectTo: 'home', 
        pathMatch: 'full'
      },
      {
        path: 'misviajes',
        loadChildren: () => import('./misviajes/misviajes.module').then( m => m.MisviajesPageModule)
      },
      {
        path: 'setting',
        loadChildren: () => import('./settings/setting/setting.module').then( m => m.SettingPageModule)
      },
      {
        path: 'notificaciones',
        loadChildren: () => import('./notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule)
      },
    
    ]
  },



 

];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
