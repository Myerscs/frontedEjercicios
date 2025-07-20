import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { WorkoutService } from 'src/app/services/workout.service';

@Component({
  selector: 'app-workout-detail',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  templateUrl: './workout-detail.page.html',
  styleUrls: ['./workout-detail.page.scss']
})
export class WorkoutDetailPage implements OnInit {
  workoutId = '';
  workout: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.workoutId = this.route.snapshot.paramMap.get('id')!;
    this.loadWorkout();
  }

  loadWorkout() {
    this.workoutService.getById(this.workoutId).subscribe({
      next: (data) => {
        this.workout = data;
      },
      error: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Error cargando el entrenamiento',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
    });
  }

  async markAsComplete() {
    const alert = await this.alertCtrl.create({
      header: 'Completar Entrenamiento',
      message: '¿Deseas marcar este entrenamiento como completado?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Completar',
          handler: () => {
            this.workoutService.markComplete(this.workoutId).subscribe({
              next: async () => {
                const toast = await this.toastCtrl.create({
                  message: '¡Entrenamiento completado!',
                  duration: 2000,
                  color: 'success'
                });
                toast.present();
                this.loadWorkout(); // Recargar datos
              },
              error: async () => {
                const toast = await this.toastCtrl.create({
                  message: 'Error al completar entrenamiento',
                  duration: 2000,
                  color: 'danger'
                });
                toast.present();
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  openInMaps() {
    if (this.workout.latitude && this.workout.longitude) {
      const url = `https://www.google.com/maps?q=${this.workout.latitude},${this.workout.longitude}`;
      window.open(url, '_blank');
    }
  }

  isScheduledSoon(): boolean {
    if (!this.workout.scheduledAt) return false;
    
    const now = new Date();
    const scheduled = new Date(this.workout.scheduledAt);
    const diffMs = scheduled.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours <= 2 && diffHours >= 0; // Próximo en las siguientes 2 horas
  }

  isPastDue(): boolean {
    if (!this.workout.scheduledAt) return false;
    
    const now = new Date();
    const scheduled = new Date(this.workout.scheduledAt);
    
    return scheduled < now && !this.workout.completed;
  }
}
