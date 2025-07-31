import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  // 🌟 Splash/Intro page
  {
    path: '',
    loadComponent: () =>
      import('./pages/auth/splash/splash.page').then(m => m.SplashPage)
  },
  // 🔓 Rutas públicas
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.page').then(m => m.LoginPage),
    canActivate: [noAuthGuard]
  },
  
{
  path: 'forgot-password',
  loadComponent: () =>
    import('./pages/auth/forgot-password/forgot-password.page').then(
      (m) => m.ForgotPasswordPage
    ),
  canActivate: [noAuthGuard] // opcional, si no quieres que entren usuarios logueados
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
      {
         path: 'nutrition',
         loadComponent: () =>
          import('./pages/tabs/nutrition/nutrition.page').then(m => m.NutritionPage)
         
      },
      
      // 📋 Rutas de workout dentro de tabs
    
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
