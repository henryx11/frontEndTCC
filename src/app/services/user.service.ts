import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UpdateProfileRequest, UpdateProfileResponse } from '../types/update-profile.type';

interface DecodedToken {
  sub: string;
  name: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly tokenKey = 'auth-token';
  private readonly userNameKey = 'user-name';
  private readonly apiUrl = 'http://26.59.168.146:8090/users';

  constructor(private httpClient: HttpClient) {}

  setToken(token: string): void {
    sessionStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  setUserName(name: string): void {
    sessionStorage.setItem(this.userNameKey, name);
  }

  getUserName(): string | null {
    return sessionStorage.getItem(this.userNameKey);
  }

  clearToken(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userNameKey);
  }

  getUserInfo(): { name: string; email: string } | null {
    const token = this.getToken();

    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      // Prioriza o nome do sessionStorage (atualizado) ao invés do token
      const savedName = this.getUserName();

      return {
        name: savedName || decoded.name || '',
        email: decoded.sub ?? ''
      };
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.clearToken();
  }

  /**
   * Atualiza o perfil do usuário
   * O backend identifica o usuário pelo token automaticamente
   */
  updateProfile(data: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.httpClient.put<UpdateProfileResponse>(`${this.apiUrl}/update`, data).pipe(
      tap((response) => {
        // Salva o novo nome no sessionStorage se foi atualizado
        if (response.name) {
          this.setUserName(response.name);
        }
      })
    );
  }
}
