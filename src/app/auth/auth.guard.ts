import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);

  if (token) {
    if (state.url.includes('signin')) {
      router.navigate(['/api/users']);
      return false;
    }
    return true;
  } else {
    if (!state.url.includes('signin')) {
      router.navigate(['/api/signin']);
    }
    return false;
  }
};