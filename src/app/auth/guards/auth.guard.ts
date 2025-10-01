import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../../services/user.service';

export const authGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  // Verifica se o usuário está autenticado
  if (userService.isAuthenticated()) {
    return true;
  }

  // Se não estiver autenticado, redireciona para login
  router.navigate(['/login']);
  return false;
};
