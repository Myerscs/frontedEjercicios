import { Component, OnInit, HostListener  } from '@angular/core';
import { Progress, ProgressService, ProgressWithTrend, ProgressStats } from 'src/app/services/progress.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Chart, LineController, LineElement, Filler, PointElement, LinearScale, Title, CategoryScale, ChartConfiguration } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale, Filler);

@Component({
  selector: 'app-progress',
  templateUrl: './progress.page.html',
  styleUrls: ['./progress.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ProgressPage implements OnInit {
  progressRecords: ProgressWithTrend[] = [];
  currentProgress: Progress = this.emptyProgress();
  isModalOpen = false;
  isDeleteModalOpen = false;
  stats: ProgressStats = {} as ProgressStats;
  weightChart: any;
  bodyFatChart: any;
  showSuccessMessage = false;
  successMessage = '';

  constructor(private progressService: ProgressService) {}

  ngOnInit() {
    this.loadProgress();
    this.loadStats();
    this.loadChartData();
  }
  @HostListener('ionViewDidEnter')
  onIonViewDidEnter() {
    this.loadAllData(); // Cada vez que se entra a esta vista
  }
  private loadAllData() {
    this.loadProgress();
    this.loadStats();
    this.loadChartData();
  }

  loadProgress() {
    this.progressService.getUserProgress().subscribe({
      next: (data: ProgressWithTrend[]) => {
        this.progressRecords = data;
      },
      error: (err: any) => console.error('Error cargando progreso', err)
    });
  }

  loadStats() {
    this.progressService.getProgressStats().subscribe({
      next: (data: ProgressStats) => {
        this.stats = data;
        this.checkForImprovements();
      },
      error: (err: any) => console.error('Error cargando estadísticas', err)
    });
  }

  loadChartData() {
    this.progressService.getChartData().subscribe({
      next: (data: any) => {
        this.createCharts(data);
      },
      error: (err: any) => console.error('Error cargando datos para gráficos', err)
    });
  }

  checkForImprovements() {
    if (this.stats.isLosingWeight && this.stats.isLosingBodyFat) {
      this.successMessage = '¡Excelente! Estás perdiendo peso y grasa corporal';
      this.showSuccessMessage = true;
      setTimeout(() => this.showSuccessMessage = false, 5000);
    } else if (this.stats.isLosingWeight) {
      this.successMessage = '¡Bien! Estás perdiendo peso';
      this.showSuccessMessage = true;
      setTimeout(() => this.showSuccessMessage = false, 4000);
    } else if (this.stats.isLosingBodyFat) {
      this.successMessage = '¡Bien! Estás reduciendo grasa corporal';
      this.showSuccessMessage = true;
      setTimeout(() => this.showSuccessMessage = false, 4000);
    }
  }

  createCharts(chartData: any) {
    if (this.weightChart) this.weightChart.destroy();
    if (this.bodyFatChart) this.bodyFatChart.destroy();

    const chartOptions: ChartConfiguration['options'] = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(0,0,0,0.1)'
          }
        },
        x: {
          grid: {
            color: 'rgba(0,0,0,0.1)'
          }
        }
      }
    };

    // Gráfico de peso con línea de tendencia
    this.weightChart = new Chart('weightChart', {
      type: 'line',
      data: {
        labels: chartData.dates,
        datasets: [
          {
            label: 'Peso (kg)',
            data: chartData.weights,
            borderColor: this.stats.isLosingWeight ? '#10dc60' : '#3880ff',
            backgroundColor: this.stats.isLosingWeight ? 'rgba(16, 220, 96, 0.1)' : 'rgba(56, 128, 255, 0.1)',
            tension: 0.1,
            fill: true,
            pointBackgroundColor: this.stats.isLosingWeight ? '#10dc60' : '#3880ff',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5
          },
          {
            label: 'Tendencia',
            data: chartData.weightTrend,
            borderColor: this.stats.isLosingWeight ? '#0cd648' : '#5a9cff',
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            tension: 0
          }
        ]
      },
      options: chartOptions
    });

    // Gráfico de grasa corporal con línea de tendencia
    this.bodyFatChart = new Chart('bodyFatChart', {
      type: 'line',
      data: {
        labels: chartData.dates,
        datasets: [
          {
            label: 'Grasa Corporal (%)',
            data: chartData.bodyFats,
            borderColor: this.stats.isLosingBodyFat ? '#10dc60' : '#ff5733',
            backgroundColor: this.stats.isLosingBodyFat ? 'rgba(16, 220, 96, 0.1)' : 'rgba(255, 87, 51, 0.1)',
            tension: 0.1,
            fill: true,
            pointBackgroundColor: this.stats.isLosingBodyFat ? '#10dc60' : '#ff5733',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5
          },
          {
            label: 'Tendencia',
            data: chartData.bodyFatTrend,
            borderColor: this.stats.isLosingBodyFat ? '#0cd648' : '#ff8a65',
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
            tension: 0
          }
        ]
      },
      options: chartOptions
    });
  }

  openEditModal(progress?: ProgressWithTrend) {
    this.currentProgress = progress ? {...progress} : this.emptyProgress();
    this.isModalOpen = true;
  }

  openDeleteModal(progress: ProgressWithTrend) {
    this.currentProgress = {...progress};
    this.isDeleteModalOpen = true;
  }

  saveProgress() {
    const operation = this.currentProgress.id 
      ? this.progressService.updateProgress(this.currentProgress.id, this.currentProgress)
      : this.progressService.registerProgress(this.currentProgress);

    operation.subscribe({
      next: () => {
        this.loadProgress();
        this.loadStats();
        this.loadChartData();
        this.isModalOpen = false;
      },
      error: (err: any) => console.error('Error guardando progreso', err)
    });
  }

  confirmDelete() {
    if (this.currentProgress.id) {
      this.progressService.deleteProgress(this.currentProgress.id).subscribe({
        next: () => {
          this.loadProgress();
          this.loadStats();
          this.loadChartData();
          this.isDeleteModalOpen = false;
        },
        error: (err: any) => console.error('Error eliminando registro', err)
      });
    }
  }

  getTrendIcon(trend: 'up' | 'down' | 'stable' | undefined): string {
    switch (trend) {
      case 'down': return 'trending-down';
      case 'up': return 'trending-up';
      default: return 'remove';
    }
  }

  getTrendColor(trend: 'up' | 'down' | 'stable' | undefined, isWeight: boolean = true): string {
    if (trend === 'down') return isWeight ? 'success' : 'success';
    if (trend === 'up') return isWeight ? 'danger' : 'danger';
    return 'medium';
  }

  getOverallTrendColor(): string {
    switch (this.stats.overallTrend) {
      case 'improving': return 'success';
      case 'declining': return 'danger';
      default: return 'medium';
    }
  }

  getOverallTrendText(): string {
    switch (this.stats.overallTrend) {
      case 'improving': return 'Mejorando';
      case 'declining': return 'Empeorando';
      default: return 'Estable';
    }
  }

  formatChange(change: number | undefined, unit: string): string {
    if (change === undefined) return '--';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}${unit}`;
  }

  private emptyProgress(): Progress {
    return {
      weightKg: 0,
      bodyFat: 0,
      notes: ''
    };
  }
}