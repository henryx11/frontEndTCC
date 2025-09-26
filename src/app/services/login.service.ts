// login.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginResponse } from '../types/login-response.type';
import { tap } from 'rxjs';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly apiUrl = 'http://26.59.168.146:8090/users';

  constructor(
    private httpClient: HttpClient,
    private userService: UserService
  ) {}

  login(email: string, password: string) {
    return this.httpClient.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        this.userService.setToken(res.token); // DELEGA ao UserService
      })
    );
  }

  register(data: { name: string; email: string; number: string; password: string; role?: number }) {
    // Se o backend exige "role" como 0, já preenche se não vier
    if (data.role === undefined) {
      data.role = 0;
    }
    return this.httpClient.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    this.userService.logout(); // DELEGA para centralizar
  }
}
