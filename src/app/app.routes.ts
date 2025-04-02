import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'api/signin', pathMatch: 'full' },
  { path: 'api/signin', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'api/users', loadComponent: () => import('./user/users/users.component').then(m => m.UsersComponent) },
  { path: 'api/users/register', loadComponent: () => import('./user/user-registration/user-registration.component').then(m => m.UserRegistrationComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'cars', loadComponent: () => import('./car/cars/cars.component').then(m => m.CarsComponent) }
];