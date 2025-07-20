import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { WorkoutService } from 'src/app/services/workout.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-create-workout',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './create-workout.page.html',
  styleUrls: ['./create-workout.page.scss']
})
export class CreateWorkoutPage {
  minDate: string = new Date().toISOString(); 
  title = '';
  description = '';
  scheduledAt = '';
  latitude: number = 0;
  longitude: number = 0;
  locationLoading = false;
new: any;

  constructor(
    private workoutService: WorkoutService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async getCurrentLocation() {
    this.locationLoading = true;
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
      
      const toast = await this.toastCtrl.create({
        message: 'Ubicación obtenida correctamente',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      
      // Usar ubicación por defecto (puedes cambiar estas coordenadas)
      this.latitude = -0.22985;
      this.longitude = -78.52495;
      
      const toast = await this.toastCtrl.create({
        message: 'No se pudo obtener la ubicación. Se usará ubicación por defecto.',
        duration: 3000,
        color: 'warning'
      });
      toast.present();
    } finally {
      this.locationLoading = false;
    }
  }

  async saveWorkout() {
    if (!this.title || !this.description || !this.scheduledAt) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos requeridos',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    // Si no se ha obtenido ubicación, usar ubicación por defecto
    if (this.latitude === 0 && this.longitude === 0) {
      this.latitude = -0.22985;
      this.longitude = -78.52495;
    }

    const newWorkout = {
      title: this.title,
      description: this.description,
      scheduledAt: this.scheduledAt,
      latitude: this.latitude,
      longitude: this.longitude
    };

    this.workoutService.create(newWorkout).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Entrenamiento creado exitosamente',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        this.router.navigate(['/tabs/workouts']);
      },
      error: async (err) => {
        console.error('Error creando entrenamiento:', err);
        const toast = await this.toastCtrl.create({
          message: 'Error al crear el entrenamiento',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }
}
