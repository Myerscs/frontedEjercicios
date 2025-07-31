import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ToastController, LoadingController, IonicModule } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation';
import { Subscription, interval } from 'rxjs';
import { WorkoutService, Workout, WorkoutFilters } from 'src/app/services/workout.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
@Component({
  selector: 'app-workouts',
  templateUrl: './workouts.page.html',
  styleUrls: ['./workouts.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
})
export class WorkoutsPage implements OnInit, OnDestroy {
  workouts: Workout[] = [];
  filteredWorkouts: Workout[] = [];
  workoutTemplates: Workout[] = [];
  isLoading = false;
  
  // Filtros y búsqueda
  searchText = '';
  selectedCategory = '';
  selectedDifficulty = '';
  selectedDate = '';
  
  // Modales
  showCreateModal = false;
  showTemplates = false;
  showDetailModal = false;
  
  // Entrenamiento actual
  currentWorkout: Workout = this.getEmptyWorkout();
  selectedWorkout: Workout | null = null;
  isEditing = false;
  loadingLocation = false;
  
  // Timer
  timerSeconds = 0;
  timerRunning = false;
  timerSubscription?: Subscription;

  constructor(
    private workoutService: WorkoutService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.loadWorkouts();
    this.loadWorkoutTemplates();
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  // Carga de dados
 async loadWorkouts() {
  this.isLoading = true;
  try {
    const filters: WorkoutFilters = {
      category: this.selectedCategory || undefined,
      difficulty: this.selectedDifficulty || undefined,
      date: this.selectedDate || undefined,
      search: this.searchText || undefined
    };

    this.workouts = await lastValueFrom(
      this.workoutService.getWorkouts(filters)
    ) || [];

    this.applyLocalFilters(); // 🔥 Aplica filtros locales
  } catch (error) {
    console.error('Error cargando entrenamientos:', error);
    await this.showToast('Error al cargar entrenamientos', 'danger');
  } finally {
    this.isLoading = false;
  }
}

  async loadWorkoutTemplates() {
    try {
      this.workoutTemplates = await this.workoutService.getWorkoutTemplates().toPromise() || [];
    } catch (error) {
      console.error('Error cargando plantillas:', error);
    }
  }

  // Pull to refresh
  async doRefresh(event: any) {
    await this.loadWorkouts();
    event.target.complete();
  }

  // Filtros y búsqueda
  onSearchChange() {
    this.applyLocalFilters();
  }

  applyFilters() {
    this.loadWorkouts();
  }

  applyLocalFilters() {
    this.filteredWorkouts = this.workouts.filter(workout => {
      const matchesSearch = !this.searchText || 
        workout.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        (workout.description && workout.description.toLowerCase().includes(this.searchText.toLowerCase()));
      
      return matchesSearch;
    });
  }

  // CRUD Operaciones
  async saveWorkout() {
    const loading = await this.loadingController.create({
      message: this.isEditing ? 'Actualizando...' : 'Creando...'
    });
    await loading.present();

    try {
      if (this.isEditing && this.currentWorkout.id) {
        await this.workoutService.updateWorkout(this.currentWorkout.id, this.currentWorkout).toPromise();
        await this.showToast('Entrenamiento actualizado', 'success');
      } else {
        await this.workoutService.createWorkout(this.currentWorkout).toPromise();
        await this.showToast('Entrenamiento creado', 'success');
      }
      
      this.showCreateModal = false;
      this.resetForm();
      await this.loadWorkouts();
    } catch (error) {
      console.error('Error guardando entrenamiento:', error);
      await this.showToast('Error al guardar entrenamiento', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  editWorkout(workout: Workout) {
    this.currentWorkout = { ...workout };
    this.isEditing = true;
    this.showCreateModal = true;
  }

  async confirmDelete(workout: Workout) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar "${workout.title}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.deleteWorkout(workout);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteWorkout(workout: Workout) {
  if (!workout.id) return;

  const loading = await this.loadingController.create({
    message: 'Eliminando...'
  });
  await loading.present();

  try {
    await lastValueFrom(this.workoutService.deleteWorkout(workout.id));

    await this.showToast('Entrenamiento eliminado', 'success');

    // 🔥 Recarga la lista desde la API
    await this.loadWorkouts();
  } catch (error) {
    console.error('Error eliminando entrenamiento:', error);
    await this.showToast('Error al eliminar entrenamiento', 'danger');
  } finally {
    await loading.dismiss();
  }
}

  async markAsCompleted(workout: Workout) {
    if (!workout.id) return;

    try {
      await this.workoutService.completeWorkout(workout.id).toPromise();
      await this.showToast('Entrenamiento completado', 'success');
      await this.loadWorkouts();
    } catch (error) {
      console.error('Error completando entrenamiento:', error);
      await this.showToast('Error al completar entrenamiento', 'danger');
    }
  }

  // Plantillas
  useTemplate(template: Workout) {
    this.currentWorkout = { ...template };
    this.isEditing = false;
    this.showTemplates = false;
    this.showCreateModal = true;
  }

  // Detalle y timer
  viewWorkoutDetail(workout: Workout) {
    this.selectedWorkout = { ...workout };
    this.showDetailModal = true;
    this.resetTimer();
  }

  startTimer() {
    this.timerRunning = true;
    this.timerSubscription = interval(1000).subscribe(() => {
      this.timerSeconds++;
    });
  }

  pauseTimer() {
    this.timerRunning = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.timerSeconds = 0;
  }

  async finishWorkout() {
    if (this.selectedWorkout && this.selectedWorkout.id) {
      await this.markAsCompleted(this.selectedWorkout);
      this.selectedWorkout.completed = true;
      this.resetTimer();
      await this.showToast('¡Entrenamiento completado!', 'success');
    }
  }

  // Geolocalización
  async getCurrentLocation() {
    this.loadingLocation = true;
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.currentWorkout.latitude = coordinates.coords.latitude;
      this.currentWorkout.longitude = coordinates.coords.longitude;
      await this.showToast('Ubicación obtenida', 'success');
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      await this.showToast('Error al obtener ubicación', 'danger');
    } finally {
      this.loadingLocation = false;
    }
  }

  // Utilidades
  getEmptyWorkout(): Workout {
    return {
      title: '',
      description: '',
      scheduledAt: '',
      completed: false
    };
  }

  resetForm() {
    this.currentWorkout = this.getEmptyWorkout();
    this.isEditing = false;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  trackByWorkoutId(index: number, workout: Workout): any {
    return workout.id || index;
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}