import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class DashboardPage {
  userName: string = 'Usuario';
  currentDate: string = new Date().toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  weather: string = 'soleado';
  currentLocation: string = 'Cargando...';
  
  stats = {
    workoutsThisWeek: 3,
    totalDistance: 15.6,
    caloriesBurned: 1240,
    activeMinutes: 120
  };

  constructor() {
    Chart.register(...registerables);
    this.loadLocation();
  }

  ionViewDidEnter() {
    this.createProgressChart();
    this.createWorkoutDistributionChart();
  }

  async loadLocation() {
    try {
      const position = await Geolocation.getCurrentPosition();
      // Simulación de obtención de nombre de ubicación
      this.currentLocation = this.getLocationName(position.coords.latitude, position.coords.longitude);
    } catch (error) {
      this.currentLocation = 'Tu ubicación actual';
    }
  }

  private getLocationName(lat: number, lng: number): string {
    // Esto es simulado - en una app real usarías una API de geocodificación inversa
    return 'Quito, Ecuador';
  }

  createProgressChart() {
    const ctx = document.getElementById('progressChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Minutos activos',
          data: [20, 30, 25, 45, 35, 50, 40],
          borderColor: '#3880ff',
          backgroundColor: 'rgba(56, 128, 255, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  createWorkoutDistributionChart() {
    const ctx = document.getElementById('workoutChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cardio', 'Fuerza', 'Flexibilidad'],
        datasets: [{
          data: [45, 30, 25],
          backgroundColor: [
            '#3880ff',
            '#3dc2ff',
            '#2dd36f'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}
