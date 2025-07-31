import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ProgressService, ProgressStats } from 'src/app/services/progress.service';

interface QuickAction {
  icon: string;
  label: string;
  color: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class DashboardPage implements OnInit {
  motivationalMessage: string = '';
  userName: string = 'Usuario';
  greeting: string = '';
  currentDate: string = '';
  currentWeight: number = 0;
  weightGoal: number = 70;
  progressStats: ProgressStats = {} as ProgressStats;
  
  quickActions: QuickAction[] = [
    { 
      icon: 'fitness', 
      label: 'Entrenar', 
      color: 'primary', 
      route: '/tabs/workouts'
    },
    { 
      icon: 'analytics', 
      label: 'Mi Progreso', 
      color: 'success', 
      route: '/tabs/progress'
    },
    { 
      icon: 'restaurant', 
      label: 'Nutrición', 
      color: 'warning', 
      route: '/tabs/nutrition'
    },
    { 
      icon: 'person', 
      label: 'Perfil', 
      color: 'tertiary', 
      route: '/tabs/profile'
    }
  ];

  constructor(
    private router: Router,
    private progressService: ProgressService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.setGreeting();
    this.updateDateTime();
    this.loadProgressData();
  }

  private loadUserData() {
    // Obtener nombre del usuario del localStorage o servicio
    this.userName = localStorage.getItem('userName') || 'Usuario';
    this.weightGoal = parseFloat(localStorage.getItem('weightGoal') || '70');
  }

  private setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.greeting = 'Buenos días';
    } else if (hour < 18) {
      this.greeting = 'Buenas tardes';
    } else {
      this.greeting = 'Buenas noches';
    }
  }

  private updateDateTime() {
    this.currentDate = new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  }

  private loadProgressData() {
    this.progressService.getProgressStats().subscribe({
      next: (data: ProgressStats) => {
        this.progressStats = data;
        this.currentWeight = data.currentWeight || 0;
      },
      error: (err) => {
        console.error('Error cargando datos de progreso', err);
        // Datos de ejemplo si no hay conexión
        this.currentWeight = 75.5;
      }
    });
  }

  navigateToAction(action: QuickAction) {
    this.router.navigate([action.route]);
  }

  getProgressPercentage(): number {
    if (this.weightGoal === 0 || this.currentWeight === 0) return 0;
    
    // Calcular progreso basado en diferencia con el objetivo
    const initialWeight = this.currentWeight + 10; // Asumimos que empezó 10kg más
    const totalToLose = initialWeight - this.weightGoal;
    const lostSoFar = initialWeight - this.currentWeight;
    
    return Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
  }

  getWeightStatus(): string {
    if (this.progressStats.isLosingWeight) {
      return '¡Vas muy bien! 💪';
    } else if (this.progressStats.overallTrend === 'stable') {
      return 'Manteniéndote estable 👍';
    } else {
      return '¡Tú puedes! 🚀';
    }
  }

  getMotivationalMessage(): string {
    const messages = [
      'Cada día es una nueva oportunidad',
      'Tu esfuerzo vale la pena',
      'Sigue adelante, vas genial',
      'La constancia es la clave del éxito',
      'Hoy es un buen día para entrenar'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}