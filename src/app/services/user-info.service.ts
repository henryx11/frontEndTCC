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
  private readonly apiUrl = 'http://26.59.168.146:8090';

  constructor(private httpClient: HttpClient) {}

  getCurrentUserInfo(): Observable<UserInfo> {
    return this.httpClient.get<UserInfo>(`${this.apiUrl}/users/me`);
  }

  /**
   * Retorna o caminho da imagem da medalha baseado no rank
   */
  getMedalImage(rank: string): string {
    const medals: { [key: string]: string } = {
      'DIAMANTE': 'medalha_diamante.png',
      'PLATINA': 'medalha_platina.png',
      'OURO': 'medalha_ouro.png',
      'BRONZE': 'medalha_bronze.png',
      'FERRO': 'medalha_ferro.png'
    };
    return medals[rank];
  }
}
