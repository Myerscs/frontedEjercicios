import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  // 🔓 Rutas públicas
  {
    path: '',
    loadComponent: () =>
      import('./pages/auth/login/login.page').then(m => m.LoginPage),
    canActivate: [noAuthGuard]
  },
  
  // 🔐 Rutas protegidas con Tabs y sus hijos
  {
    path: 'tabs',
    loadComponent: () =>
      import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/tabs/dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'workouts',
        loadComponent: () =>
          import('./pages/tabs/workouts/workouts.page').then(m => m.WorkoutsPage)
      },
      {
        path: 'exercises',
        loadComponent: () =>
          import('./pages/tabs/exercises/exercises.page').then(m => m.ExercisesPage)
      },
      {
        path: 'routes',
        loadComponent: () =>
          import('./pages/tabs/routes/routes.page').then(m => m.RoutesPage)
      },
      {
        path: 'progress',
        loadComponent: () =>
          import('./pages/tabs/progress/progress.page').then(m => m.ProgressPage)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/tabs/profile/profile.page').then(m => m.ProfilePage)
      },
      
      // 📋 Rutas de workout dentro de tabs
      {
        path: 'create-workout',
        loadComponent: () =>
          import('./pages/create-workout/create-workout.page').then(m => m.CreateWorkoutPage)
      },
      {
        path: 'edit-workout/:id',
        loadComponent: () =>
          import('./pages/edit-workout/edit-workout.page').then(m => m.EditWorkoutPage)
      },
      {
        path: 'workout-detail/:id',
        loadComponent: () =>
          import('./pages/workout-detail/workout-detail.page').then(m => m.WorkoutDetailPage)
      },
      
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  
  // 🔁 Catch-all
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
