import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './app/interceptors/auth.interceptor';
import {  provideIonicAngular } from '@ionic/angular/standalone';
import { errorInterceptor } from './app/interceptors/error.interceptor';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { AppComponent } from './app/app.component';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { environment } from './environments/environment';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';


bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideIonicAngular(),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    
  ]
});

