import { Component, OnInit } from '@angular/core';
import { IonicModule, AlertController, ModalController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from 'src/app/services/workout.service';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './workouts.page.html',
  styleUrls: ['./workouts.page.scss']
})
export class WorkoutsPage implements OnInit {
    

  workouts: any[] = [];
  
  // Variables para crear/editar
  isCreateModalOpen = false;
  isEditModalOpen = false;
  isDetailModalOpen = false;
  
  // Datos del formulario
  currentWorkout: any = {};
  title = '';
  description = '';
  scheduledAt = '';
  minDate: string = new Date().toISOString();
  latitude: number = 0;
  longitude: number = 0;
  locationLoading = false;
  
  // ID para edición
  editingWorkoutId = '';

  constructor(
    private workoutService: WorkoutService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadWorkouts();
  }

  loadWorkouts() {
    this.workoutService.getAll().subscribe({
      next: (data) => {
        this.workouts = data;
      },
      error: (err) => {
        console.error('Error cargando entrenamientos', err);
      }
    });
  }

  // MODAL DE CREAR
  openCreateModal() {
    this.resetForm();
    this.isCreateModalOpen = true;
  }

  closeCreateModal() {
    this.isCreateModalOpen = false;
    this.resetForm();
  }

  // MODAL DE EDITAR
  openEditModal(workout: any) {
    this.editingWorkoutId = workout.id;
    this.title = workout.title;
    this.description = workout.description;
    this.scheduledAt = workout.scheduledAt;
    this.latitude = workout.latitude || 0;
    this.longitude = workout.longitude || 0;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.resetForm();
  }

  // MODAL DE DETALLES
  openDetailModal(workout: any) {
    this.currentWorkout = workout;
    this.isDetailModalOpen = true;
  }

  closeDetailModal() {
    this.isDetailModalOpen = false;
    this.currentWorkout = {};
  }

  // FUNCIONES DE FORMULARIO
  resetForm() {
    this.title = '';
    this.description = '';
    this.scheduledAt = '';
    this.latitude = 0;
    this.longitude = 0;
    this.editingWorkoutId = '';
    this.locationLoading = false;
  }

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
      
      // Usar ubicación por defecto
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

  // CREAR ENTRENAMIENTO
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
        this.closeCreateModal();
        this.loadWorkouts();
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

  // ACTUALIZAR ENTRENAMIENTO
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

    this.workoutService.update(this.editingWorkoutId, updatedWorkout).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Entrenamiento actualizado exitosamente',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        this.closeEditModal();
        this.loadWorkouts();
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

  // ELIMINAR ENTRENAMIENTO
  async confirmDelete(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro que deseas eliminar este entrenamiento?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => this.deleteWorkout(id)
        }
      ]
    });
    await alert.present();
  }

  deleteWorkout(id: string) {
    this.workoutService.delete(id).subscribe(() => {
      this.loadWorkouts();
    });
  }

  // COMPLETAR ENTRENAMIENTO
  async markAsComplete(id: string) {
    this.workoutService.markComplete(id).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: '¡Entrenamiento completado!',
          duration: 2000,
          color: 'success'
        });
        toast.present();
        this.loadWorkouts();
        if (this.isDetailModalOpen) {
          // Actualizar el workout actual si está en vista de detalles
          this.currentWorkout = { ...this.currentWorkout, completed: true };
        }
      },
      error: (err: any) => {
        console.error('Error marcando como completado', err);
      }
    });
  }

  // UTILIDADES
  openInMaps(workout: any) {
    if (workout.latitude && workout.longitude) {
      const url = `https://www.google.com/maps?q=${workout.latitude},${workout.longitude}`;
      window.open(url, '_blank');
    }
  }

  isScheduledSoon(scheduledAt: string): boolean {
    if (!scheduledAt) return false;
    
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diffMs = scheduled.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours <= 2 && diffHours >= 0;
  }

  isPastDue(workout: any): boolean {
    if (!workout.scheduledAt) return false;
    
    const now = new Date();
    const scheduled = new Date(workout.scheduledAt);
    
    return scheduled < now && !workout.completed;
  }
}