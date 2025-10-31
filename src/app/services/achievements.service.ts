import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Achievement {
  uuid: string;
  title: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AchievementsService {
  private readonly apiUrl = 'http://26.59.168.146:8090/archivement/arch';

  constructor(private httpClient: HttpClient) {}

  getAchievements(): Observable<Achievement[]> {
    return this.httpClient.get<Achievement[]>(this.apiUrl);
  }
}
