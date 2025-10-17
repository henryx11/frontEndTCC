import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Mission {
  uuid: string;
  title: string;
  description: string;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class MissionsService {
  private readonly apiUrl = 'http://26.59.168.146:8090/missions';

  constructor(private httpClient: HttpClient) {}

  getMissions(): Observable<Mission[]> {
    return this.httpClient.get<Mission[]>(this.apiUrl);
  }
}
