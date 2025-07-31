import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { App as CapacitorApp } from '@capacitor/app';
import { provideAuth, getAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [HttpClientModule,IonApp, IonRouterOutlet],
})
export class AppComponent {
  
  constructor(private router: Router) {
    
     // Validar si pasaron más de 60 minutos desde el último uso
    const lastUsedAt = localStorage.getItem('lastUsedAt');
    if (lastUsedAt) {
      const diff = Date.now() - parseInt(lastUsedAt, 10);
      const minutes = diff / (1000 * 60);
      if (minutes > 60) {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        localStorage.removeItem('userId');
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    }

    // Guardar timestamp cuando se minimiza la app
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        localStorage.setItem('lastUsedAt', Date.now().toString());
      }
    });
  }
   
}

