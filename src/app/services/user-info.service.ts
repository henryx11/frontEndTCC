import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserAuthority {
  authority: string;
}

export interface UserInfo {
  uuid: string;
  name: string;
  role: string;
  active: string;
  rank: string;
  authorities: UserAuthority[];
  xp: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  private readonly apiUrl = 'http://26.59.168.146:8090/users';

  constructor(private httpClient: HttpClient) {}

  /**
   * Busca informações do usuário logado
   */
  getCurrentUserInfo(): Observable<UserInfo> {
    return this.httpClient.get<UserInfo>(`${this.apiUrl}/users`);
  }

  /**
   * Retorna o caminho da imagem da medalha baseado no rank
   */
  getMedalImage(rank: string): string {
    const medals: { [key: string]: string } = {
      'OURO': 'medalha_ouro.png',
      'PRATA': 'medalha_prata.png',
      'SILVER': 'medalha_prata.png',
      'BRONZE': 'medalha_bronze.png'
    };
    return medals[rank.toUpperCase()] || 'medalha_bronze.png';
  }
}
