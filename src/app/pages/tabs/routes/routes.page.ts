import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonItem, IonLabel, IonInput, IonSegment, IonSegmentButton, IonButtons,
  IonModal, IonLoading, IonToast, AlertController, LoadingController
} from '@ionic/angular/standalone';
import * as mapboxgl from 'mapbox-gl';
import { Geolocation } from '@capacitor/geolocation';
import { RoutesService, Route } from 'src/app/services/route.service';
import { addIcons } from 'ionicons';
import { 
  add, close, create, trash, play, pause, refresh, checkmark, save,
  mapOutline, peopleOutline
} from 'ionicons/icons';


@Component({
  selector: 'app-routes',
  templateUrl: './routes.page.html',
  styleUrls: ['./routes.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonIcon, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonItem, IonLabel, IonInput, IonSegment, IonSegmentButton,
    IonButtons, IonModal, IonLoading, IonToast,
  ]
})
export class RoutesPage implements AfterViewInit, OnDestroy {
  // Map properties
  map!: mapboxgl.Map;
  latitud!: number;
  longitud!: number;

  // Route creation
  isCreatingRoute = false;
  routePoints: [number, number][] = [];
  newRouteName = '';
  routeSource: any;
  routeLayer: any;

  // Data
  myRoutes: Route[] = [];
  popularRoutes: Route[] = [];
  activeTab = 'my-routes';
  selectedRoute: Route | null = null;

  // Timer
  showTimer = false;
  timerActive = false;
  elapsedTime = 0;
  timerInterval: any;

  // UI
  loading = false;
  showToast = false;
  toastMessage = '';

  constructor(
    private routesService: RoutesService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    addIcons({ 
      add, close, create, trash, play, pause, refresh, checkmark, save,
      mapOutline, peopleOutline
    });
  }

  async ngAfterViewInit() {
    await this.getCurrentPosition();
    await this.loadRoutes();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  async getCurrentPosition() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.latitud = coordinates.coords.latitude;
      this.longitud = coordinates.coords.longitude;
      this.loadMap();
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
      this.showMessage('Error al obtener la ubicación');
    }
  }

  loadMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.longitud, this.latitud],
      zoom: 13,
      accessToken: 'pk.eyJ1IjoidGhvbWFza2x6IiwiYSI6ImNsM3VibWJwbTI4emkzZXBlamVjOHp0Z2YifQ.QhFxYxdIC2m4vGlEkMqrow',
    });

    this.map.on('load', () => {
      this.map.resize();

      // Marcador de ubicación actual
      new mapboxgl.Marker({ color: 'red' })
        .setLngLat([this.longitud, this.latitud])
        .setPopup(new mapboxgl.Popup().setText('¡Estás aquí!'))
        .addTo(this.map);

      // Controles del mapa
      this.map.addControl(new mapboxgl.NavigationControl(), 'top-left');
      this.map.addControl(new mapboxgl.FullscreenControl(), 'top-left');

      // Listener para crear rutas
      this.map.on('click', (e) => {
        if (this.isCreatingRoute) {
          this.addRoutePoint(e.lngLat.lng, e.lngLat.lat);
        }
      });

      this.displayExistingRoutes();
    });
  }

  toggleCreateMode() {
    this.isCreatingRoute = !this.isCreatingRoute;
    if (!this.isCreatingRoute) {
      this.clearRoute();
    }
  }

  addRoutePoint(lng: number, lat: number) {
    this.routePoints.push([lng, lat]);
    
    // Agregar marcador
    new mapboxgl.Marker({ color: 'blue' })
      .setLngLat([lng, lat])
      .addTo(this.map);

    // Dibujar línea si hay más de un punto
    if (this.routePoints.length > 1) {
      this.drawRoute();
    }
  }

  drawRoute() {
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: this.routePoints
      }
    };

    if (this.map.getSource('route')) {
      (this.map.getSource('route') as mapboxgl.GeoJSONSource).setData(geojson as any);
    } else {
      this.map.addSource('route', {
        type: 'geojson',
        data: geojson as any
      });

      this.map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3880ff',
          'line-width': 4
        }
      });
    }
  }

  calculateDistance(): number {
    if (this.routePoints.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < this.routePoints.length; i++) {
      totalDistance += this.getDistanceBetweenPoints(
        this.routePoints[i-1][1], this.routePoints[i-1][0],
        this.routePoints[i][1], this.routePoints[i][0]
      );
    }
    return totalDistance;
  }

  getDistanceBetweenPoints(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  clearRoute() {
    this.routePoints = [];
    this.newRouteName = '';
    
    // Limpiar marcadores y líneas del mapa
    if (this.map.getSource('route')) {
      this.map.removeLayer('route');
      this.map.removeSource('route');
    }
    
    // Limpiar marcadores (esto es simplificado, idealmente guardarías referencias)
    const markers = document.querySelectorAll('.mapboxgl-marker');
    markers.forEach((marker, index) => {
      if (index > 0) { // Mantener el marcador de ubicación actual (índice 0)
        marker.remove();
      }
    });
  }

  canSaveRoute(): boolean {
    return this.newRouteName.trim().length > 0 && this.routePoints.length > 1;
  }

  async saveRoute() {
    if (!this.canSaveRoute()) return;

    const loading = await this.loadingController.create({
      message: 'Guardando ruta...'
    });
    await loading.present();

    const route: Route = {
      name: this.newRouteName.trim(),
      distanceKm: parseFloat(this.calculateDistance().toFixed(2)),
      geoJson: {
        type: 'LineString',
        coordinates: this.routePoints
      }
    };

    try {
      await this.routesService.createRoute(route).toPromise();
      this.showMessage('Ruta guardada exitosamente');
      this.toggleCreateMode();
      await this.loadRoutes();
    } catch (error) {
      console.error('Error al guardar la ruta:', error);
      this.showMessage('Error al guardar la ruta');
    } finally {
      await loading.dismiss();
    }
  }

  async loadRoutes() {
    this.loading = true;
    
    try {
      if (this.activeTab === 'my-routes') {
        this.myRoutes = await this.routesService.getRoutes().toPromise() || [];
      } else {
        this.popularRoutes = await this.routesService.getPopularRoutes().toPromise() || [];
      }
    } catch (error) {
      console.error('Error al cargar las rutas:', error);
      this.showMessage('Error al cargar las rutas');
    } finally {
      this.loading = false;
    }
  }

  onTabChange() {
    this.loadRoutes();
  }

  showRouteOnMap(route: Route) {
    if (!route.geoJson || !route.geoJson.coordinates) return;

    // Limpiar ruta anterior
    if (this.map.getSource('selected-route')) {
      this.map.removeLayer('selected-route');
      this.map.removeSource('selected-route');
    }

    // Mostrar ruta seleccionada
    this.map.addSource('selected-route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: route.geoJson
      } as any
    });

    this.map.addLayer({
      id: 'selected-route',
      type: 'line',
      source: 'selected-route',
      paint: {
        'line-color': '#ff6b35',
        'line-width': 5
      }
    });

    // Ajustar vista del mapa
    const coordinates = route.geoJson.coordinates;
    const bounds = coordinates.reduce((bounds: any, coord: any) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    this.map.fitBounds(bounds, { padding: 50 });
  }

  async deleteRoute(route: Route) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar la ruta "${route.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await this.routesService.deleteRoute(route.id!).toPromise();
              this.showMessage('Ruta eliminada');
              await this.loadRoutes();
            } catch (error) {
              console.error('Error al eliminar la ruta:', error);
              this.showMessage('Error al eliminar la ruta');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  editRoute(route: Route) {
    // Implementar edición de rutas
    this.showMessage('Función de editar en desarrollo');
  }

  startTimer(route?: Route) {
    if (route) {
      this.selectedRoute = route;
      this.showTimer = true;
      this.showRouteOnMap(route);
    }
    
    if (!this.timerActive) {
      this.timerActive = true;
      this.timerInterval = setInterval(() => {
        this.elapsedTime++;
      }, 1000);
    }
  }

  pauseTimer() {
    this.timerActive = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.elapsedTime = 0;
  }

  stopTimer() {
    this.pauseTimer();
    this.resetTimer();
    this.showTimer = false;
    this.selectedRoute = null;
  }

  async finishRun() {
    if (!this.selectedRoute || this.elapsedTime === 0) return;

    const alert = await this.alertController.create({
      header: 'Registrar tiempo',
      message: `¿Registrar tiempo de ${this.formatTime(this.elapsedTime)} para la ruta "${this.selectedRoute.name}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Registrar',
          handler: async () => {
            try {
              await this.routesService.recordTime(this.selectedRoute!.id!, this.elapsedTime).toPromise();
              this.showMessage('Tiempo registrado exitosamente');
              this.stopTimer();
            } catch (error) {
              console.error('Error al registrar el tiempo:', error);
              this.showMessage('Error al registrar el tiempo');
            }
          }
        }
      ]
    });
    await alert.present();
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

  trackByRouteId(index: number, route: Route): number {
    return route.id || index;
  }

  displayExistingRoutes() {
    // Mostrar todas las rutas existentes en el mapa como referencia
    [...this.myRoutes, ...this.popularRoutes].forEach((route, index) => {
      if (route.geoJson && route.geoJson.coordinates) {
        const sourceId = `route-${route.id}-${index}`;
        const layerId = `route-layer-${route.id}-${index}`;

        if (!this.map.getSource(sourceId)) {
          this.map.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: { name: route.name },
              geometry: route.geoJson
            } as any
          });

          this.map.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': '#888888',
              'line-width': 2,
              'line-opacity': 0.6
            }
          });
        }
      }
    });
  }

  showMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
  }
}