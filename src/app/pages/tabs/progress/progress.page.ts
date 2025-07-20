import { Component, OnInit } from '@angular/core';
import { Progress, ProgressService } from 'src/app/services/progress.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.page.html',
  styleUrls: ['./progress.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ProgressPage implements OnInit {
  progressRecords: Progress[] = [];
  currentProgress: Progress = this.emptyProgress();
  isModalOpen = false;
  isDeleteModalOpen = false;
  stats: any = {};
  weightChart: any;
  bodyFatChart: any;

  constructor(private progressService: ProgressService) {}

  ngOnInit() {
    this.loadProgress();
    this.loadStats();
    this.loadChartData();
  }

  loadProgress() {
    this.progressService.getUserProgress().subscribe({
      next: (data: any[]) => {
        this.progressRecords = data.sort((a, b) => 
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        );
      },
      error: (err: any) => console.error('Error cargando progreso', err)
    });
  }

  loadStats() {
    this.progressService.getProgressStats().subscribe({
      next: (data: any) => {
        this.stats = data;
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

  createCharts(chartData: any) {
    // Destruye gráficos existentes si hay
    if (this.weightChart) this.weightChart.destroy();
    if (this.bodyFatChart) this.bodyFatChart.destroy();

    // Gráfico de peso
    this.weightChart = new Chart('weightChart', {
      type: 'line',
      data: {
        labels: chartData.dates,
        datasets: [{
          label: 'Peso (kg)',
          data: chartData.weights,
          borderColor: '#3880ff',
          tension: 0.1,
          fill: false
        }]
      }
    });

    // Gráfico de grasa corporal
    this.bodyFatChart = new Chart('bodyFatChart', {
      type: 'line',
      data: {
        labels: chartData.dates,
        datasets: [{
          label: 'Grasa Corporal (%)',
          data: chartData.bodyFats,
          borderColor: '#ff5733',
          tension: 0.1,
          fill: false
        }]
      }
    });
  }

  openEditModal(progress?: Progress) {
    this.currentProgress = progress ? {...progress} : this.emptyProgress();
    this.isModalOpen = true;
  }

  openDeleteModal(progress: Progress) {
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
      this.progressService.updateProgress(this.currentProgress.id, this.currentProgress).subscribe({
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

  private emptyProgress(): Progress {
    return {
      weightKg: 0,
      bodyFat: 0,
      notes: ''
    };
  }
}
