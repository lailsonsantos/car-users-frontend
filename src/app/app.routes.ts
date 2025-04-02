import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'api/signin', pathMatch: 'full' },
  { path: 'api/signin', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'api/users', loadComponent: () => import('./user/users/users.component').then(m => m.UsersComponent) },
  { path: 'api/users/register', loadComponent: () => import('./user/user-registration/user-registration.component').then(m => m.UserRegistrationComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'api/cars', canActivate: [authGuard], loadComponent: () => import('./car/cars/cars.component').then(m => m.CarsComponent) }
];