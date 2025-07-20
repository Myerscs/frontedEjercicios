import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from 'src/app/services/workout.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-edit-workout',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-workout.page.html',
  styleUrls: ['./edit-workout.page.scss']
})
export class EditWorkoutPage implements OnInit {
  minDate: string = new Date().toISOString(); 
  workoutId: string = '';
  title = '';
  description = '';
  scheduledAt = '';
  latitude: number = 0;
  longitude: number = 0;
  locationLoading = false;

  constructor(
    private route: ActivatedRoute,
    private workoutService: WorkoutService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.workoutId = this.route.snapshot.paramMap.get('id')!;
    this.loadWorkout();
  }

  loadWorkout() {
    this.workoutService.getById(this.workoutId).subscribe({
      next: (res) => {
        this.title = res.title;
        this.description = res.description;
        this.scheduledAt = res.scheduledAt;
        this.latitude = res.latitude || 0;
        this.longitude = res.longitude || 0;
      },
      error: () => {
        this.toastCtrl.create({
          message: 'Error cargando entrenamiento',
          duration: 2000,
          color: 'danger'
        }).then(t => t.present());
      }
    });
  }

  async getCurrentLocation() {
    this.locationLoading = true;
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
      
      const toast = await this.toastCtrl.create({
        message: 'Ubicación actualizada correctamente',
        duration: 2000,
        color: 'success'
      });
      toast.present();
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      const toast = await this.toastCtrl.create({
        message: 'No se pudo obtener la ubicación',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
    } finally {
      this.locationLoading = false;
    }
  }

  async updateWorkout() {
    if (!this.title || !this.description || !this.scheduledAt) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos requeridos',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    const updatedWorkout = {
      title: this.title,
      description: this.description,
      scheduledAt: this.scheduledAt,
      latitude: this.latitude,
      longitude: this.longitude
    };

    this.workoutService.update(this.workoutId, updatedWorkout).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Entrenamiento actualizado exitosamente',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        this.router.navigate(['/tabs/workouts']);
      },
      error: async (err) => {
        console.error('Error actualizando entrenamiento:', err);
        const toast = await this.toastCtrl.create({
          message: 'Error al actualizar el entrenamiento',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }
}
