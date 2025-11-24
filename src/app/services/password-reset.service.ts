import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  // Você pode configurar isso de duas formas:
  // 1. Hardcoded: private apiUrl = 'http://192.168.0.107:8080';
  // 2. Ou criar um arquivo environment.ts na raiz do projeto
  private apiUrl = 'http://26.59.168.146:8090'; // ← AJUSTE AQUI para o IP correto do seu backend

  constructor(private http: HttpClient) {}

  /**
   * Envia email de recuperação de senha
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  /**
   * Redefine a senha com o token recebido por email
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, {
      token,
      newPassword
    });
  }
}
