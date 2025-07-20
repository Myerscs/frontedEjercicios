import { Component, OnInit } from '@angular/core';
import { Exercise, ExerciseService } from 'src/app/services/exercise.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-exercises',
  templateUrl: './exercises.page.html',
  styleUrls: ['./exercises.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ExercisesPage implements OnInit {
  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  currentExercise: Exercise = this.emptyExercise();
  isModalOpen = false;
  isDeleteModalOpen = false;
  searchTerm = '';
  selectedCategory = '';
  categories = ['Cardio', 'Fuerza', 'Flexibilidad', 'Equilibrio', 'Resistencia'];
  muscleGroups = ['Pecho', 'Espalda', 'Piernas', 'Brazos', 'Hombros', 'Abdomen', 'Cuerpo completo'];

  constructor(private exerciseService: ExerciseService) {}

  ngOnInit() {
    this.loadExercises();
  }

  loadExercises() {
    this.exerciseService.getExercises().subscribe({
      next: (data: Exercise[]) => {
        this.exercises = data;
        this.filteredExercises = [...data];
      },
      error: (err: any) => console.error('Error al cargar ejercicios', err)
    });
  }

  filterExercises() {
    this.filteredExercises = this.exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        exercise.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || exercise.category === this.selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }

  openEditModal(exercise?: Exercise) {
    this.currentExercise = exercise ? { ...exercise } : this.emptyExercise();
    // Convertir muscles string a array si viene separado por coma
    if (typeof this.currentExercise.muscles === 'string') {
      this.currentExercise.muscles = this.currentExercise.muscles.split(',').map(m => m.trim());
    }
    this.isModalOpen = true;
  }

  openDeleteModal(exercise: Exercise) {
    this.currentExercise = { ...exercise };
    this.isDeleteModalOpen = true;
  }

  saveExercise() {
    const exerciseToSave = {
      ...this.currentExercise,
      muscles: Array.isArray(this.currentExercise.muscles)
        ? this.currentExercise.muscles.join(', ')
        : this.currentExercise.muscles
    };

    const operation = this.currentExercise.id
      ? this.exerciseService.updateExercise(this.currentExercise.id, exerciseToSave)
      : this.exerciseService.createExercise(exerciseToSave);

    operation.subscribe({
      next: () => {
        this.loadExercises();
        this.isModalOpen = false;
      },
      error: (err: any) => console.error('Error al guardar el ejercicio', err)
    });
  }

  confirmDelete() {
    if (this.currentExercise.id) {
      this.exerciseService.deleteExercise(this.currentExercise.id).subscribe({
        next: () => {
          this.loadExercises();
          this.isDeleteModalOpen = false;
        },
        error: (err: any) => console.error('Error al eliminar el ejercicio', err)
      });
    }
  }

  private emptyExercise(): Exercise {
    return {
      name: '',
      category: '',
      muscles: '',
      description: ''
    };
  }
}
