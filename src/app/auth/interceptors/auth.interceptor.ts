import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const router = inject(Router);

  // Pega o token do UserService
  const token = userService.getToken();

  // Se existe token, clona a requisição e adiciona o header Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Continua com a requisição e trata erros
  return next(req).pipe(
    catchError((error) => {
      // Se receber erro 401 (não autorizado), faz logout e redireciona
      if (error.status === 401) {
        userService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );
};
