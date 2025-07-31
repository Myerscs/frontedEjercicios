import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@capacitor/geolocation';
import { HttpClientModule } from '@angular/common/http';
import { RoutesService } from 'src/app/services/route.service';

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [CommonModule, IonicModule, HttpClientModule],
  templateUrl: './routes.page.html',
  styleUrls: ['./routes.page.scss'],
})
export class RoutesPage implements OnInit, AfterViewInit {
  map!: mapboxgl.Map;
  mapboxToken = 'pk.eyJ1IjoidGhvbWFza2x6IiwiYSI6ImNsM3VibWJwbTI4emkzZXBlamVjOHp0Z2YifQ.QhFxYxdIC2m4vGlEkMqrow';
  userLocation: [number, number] | null = null;
  mapLoaded = false;
  routes: any[] = [];
  popularRoutes: any[] = [];
  selectedCoordsList: [number, number][] = [];
  markers: mapboxgl.Marker[] = [];

  private routeService = inject(RoutesService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);

  // Cronómetro
  timer: any = null;
  elapsedSeconds = 0;
  activeRouteId: number | null = null;
  localStatus: { [routeId: number]: 'pending' | 'started' | 'completed' } = {};

  async ngOnInit() {
    const saved = localStorage.getItem('routeStatuses');
    this.localStatus = saved ? JSON.parse(saved) : {};
    await this.getUserLocation();
    this.loadRoutes();
    this.loadPopularRoutes();
  }

  ngAfterViewInit() {
    this.initMap();
  }

  async getUserLocation() {
    const coords = await Geolocation.getCurrentPosition();
    this.userLocation = [coords.coords.longitude, coords.coords.latitude];
  }

  initMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      accessToken: this.mapboxToken,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.userLocation || [-78.4678, -0.1807],
      zoom: 14
    });

    this.map.on('load', () => {
      this.mapLoaded = true;

      if (this.userLocation) {
        new mapboxgl.Marker({ color: 'green' })
          .setLngLat(this.userLocation)
          .setPopup(new mapboxgl.Popup().setText('Tu ubicación'))
          .addTo(this.map);

        this.map.flyTo({ center: this.userLocation, zoom: 14 });
      }

      this.routes.forEach(route => this.drawRoute(route, '#3b82f6'));
      this.popularRoutes.forEach(route => this.drawRoute(route, '#f97316'));
    });

    this.map.on('click', (e) => {
      const coord: [number, number] = [e.lngLat.lng, e.lngLat.lat];
      this.selectedCoordsList.push(coord);

      const marker = new mapboxgl.Marker({ color: 'blue' })
        .setLngLat(coord)
        .setPopup(new mapboxgl.Popup().setText(`Punto ${this.selectedCoordsList.length}`))
        .addTo(this.map);

      this.markers.push(marker);
    });
  }

drawRoute(route: any, color: string) {
  const sourceId = `route-${route.id}`;
  const layerId = `layer-${route.id}`;

  // Evita duplicar fuentes/capas
  if (this.map.getLayer(layerId)) {
    this.map.removeLayer(layerId);
  }
  if (this.map.getSource(sourceId)) {
    this.map.removeSource(sourceId);
  }

  let geojsonData;
  try {
    geojsonData = typeof route.geoJson === 'string' ? JSON.parse(route.geoJson) : route.geoJson;
  } catch {
    console.warn('GeoJSON inválido para la ruta', route.id);
    return;
  }

  // 🔹 Verifica si el estilo ya está cargado
  if (!this.map.isStyleLoaded()) {
    this.map.once('styledata', () => this.drawRoute(route, color));
    return;
  }

  this.map.addSource(sourceId, {
    type: 'geojson',
    data: geojsonData
  });

  this.map.addLayer({
    id: layerId,
    type: 'line',
    source: sourceId,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': color, 'line-width': 4 }
  });
}

  // Nuevo: pide nombre antes de guardar ruta
  async saveNewRoute() {
    if (this.selectedCoordsList.length < 2) {
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Selecciona al menos dos puntos para crear una ruta',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Nombre de la ruta',
      inputs: [
        {
          name: 'routeName',
          type: 'text',
          placeholder: 'Ej: Cardio senderismo'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
        handler: async (data) => {
  if (!data.routeName || data.routeName.trim().length < 3) {
    const toast = await this.toastCtrl.create({
      message: 'El nombre debe tener al menos 3 caracteres',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
    return false; // cancela cierre del alert
  }
  this.createRoute(data.routeName.trim());
  return true;  // permite cierre del alert
}
        }
      ]
    });

    await alert.present();
  }

  private createRoute(name: string) {
    const newRoute = {
      name,
      distanceKm: 0,
      geoJson: {
        type: 'LineString',
        coordinates: this.selectedCoordsList
      },
      status: 'pending' // Estado inicial pendiente
    };

    this.routeService.createRoute(newRoute).subscribe({
      next: async () => {
        const toast = await this.toastCtrl.create({
          message: 'Ruta creada correctamente',
          duration: 2000,
          color: 'success'
        });
        await toast.present();

        this.selectedCoordsList = [];
        this.clearSelectedMarkers();
        this.loadRoutes();
      },
      error: async (err) => {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: 'Error al crear la ruta: ' + err.message,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  clearSelectedMarkers() {
    this.markers.forEach(m => m.remove());
    this.markers = [];
  }

  // Cronómetro
  startRoute(routeId: number) {
  if (this.timer) return; // Ya está corriendo

  this.activeRouteId = routeId;
  this.elapsedSeconds = 0;
  this.timer = setInterval(() => {
    this.elapsedSeconds++;
  }, 1000);

  // Simular cambio estado local
  this.localStatus[routeId] = 'started';
  this.loadRoutes(); // refrescar vista
  this.showToast('Ruta iniciada (local)');
}

 resetTimer() {
  this.elapsedSeconds = 0;
}

  completeRoute(routeId: number) {
  if (this.timer) {
    clearInterval(this.timer);
    this.timer = null;
    this.activeRouteId = null;
  }

  // Simular cambio estado local
  this.localStatus[routeId] = 'completed';
  this.loadRoutes();
  this.showToast('Ruta completada ');
  
  localStorage.setItem('routeStatuses', JSON.stringify(this.localStatus));
}
 async ionViewWillEnter() {
  await this.getUserLocation();
  this.loadRoutes();
  this.loadPopularRoutes();

  if (this.map) {
    this.map.remove();  // eliminar mapa viejo para reinicializar
    this.initMap();
  }
}

  async deleteRoute(routeId: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: '¿Estás seguro que quieres eliminar esta ruta?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.routeService.deleteRoute(routeId).subscribe(() => {
              this.showToast('Ruta eliminada');
              this.loadRoutes();
            });
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: 'primary'
    });
    toast.present();
  }

 loadRoutes() {
  this.routeService.getUserRoutes().subscribe(routes => {
    this.routes = routes.map(route => ({
      ...route,
      status: this.localStatus[route.id] || 'pending'
    }));

    if (this.mapLoaded && this.map.isStyleLoaded()) {
      this.routes.forEach(route => this.drawRoute(route, '#3b82f6'));
    } else if (this.mapLoaded) {
      this.map.once('styledata', () => {
        this.routes.forEach(route => this.drawRoute(route, '#3b82f6'));
      });
    }
  });
}

  
loadPopularRoutes() {
  this.routeService.getPopularRoutes().subscribe(routes => {
    this.popularRoutes = routes;

    if (this.mapLoaded && this.map.isStyleLoaded()) {
      routes.forEach(route => this.drawRoute(route, '#f97316'));
    } else if (this.mapLoaded) {
      this.map.once('styledata', () => {
        routes.forEach(route => this.drawRoute(route, '#f97316'));
      });
    }
  });
}

  formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}
