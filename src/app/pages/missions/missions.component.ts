import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionsService, Mission } from '../../services/missions.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './missions.component.html',
  styleUrl: './missions.component.scss'
})
export class MissionsComponent implements OnInit {
  missions: Mission[] = [];
  isLoading = true;

  constructor(
    private missionsService: MissionsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadMissions();
  }

  loadMissions(): void {
    this.isLoading = true;
    this.missionsService.getMissions().subscribe({
      next: (data) => {
        this.missions = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar missões:', error);
        this.toastr.error('Erro ao carregar as missões', 'Erro');
        this.isLoading = false;
      }
    });
  }
}
