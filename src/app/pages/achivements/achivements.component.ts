import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AchievementsService, Achievement } from '../../services/achievements.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-achivements',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './achivements.component.html',
  styleUrl: './achivements.component.scss'
})
export class AchivementsComponent implements OnInit {
  achievements: Achievement[] = [];
  topShelfAchievements: Achievement[] = [];
  bottomShelfAchievements: Achievement[] = [];
  isLoading = true;

  constructor(
    private achievementsService: AchievementsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAchievements();
    // Verifica novas conquistas a cada 30 segundos
    setInterval(() => this.checkForNewAchievements(), 30000);
  }

  loadAchievements(): void {
    this.isLoading = true;
    this.achievementsService.getAchievements().subscribe({
      next: (data) => {
        this.achievements = data;
        this.distributeAchievements();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar conquistas:', error);
        this.toastr.error('Erro ao carregar as conquistas', 'Erro');
        this.isLoading = false;
      }
    });
  }

  checkForNewAchievements(): void {
    const previousAchievements = [...this.achievements];

    this.achievementsService.getAchievements().subscribe({
      next: (data) => {
        // Verifica se alguma conquista foi desbloqueada
        data.forEach(newAchievement => {
          const oldAchievement = previousAchievements.find(a => a.uuid === newAchievement.uuid);

          // Se a conquista estava incompleta e agora está completa
          if (oldAchievement && !oldAchievement.completed && newAchievement.completed) {
            this.showAchievementUnlocked(newAchievement);
          }
        });

        this.achievements = data;
        this.distributeAchievements();
      },
      error: (error) => {
        console.error('Erro ao verificar novas conquistas:', error);
      }
    });
  }

  showAchievementUnlocked(achievement: Achievement): void {
    // Toca som de notificação
    this.playNotificationSound();

    // Exibe notificação usando Toastr com configurações customizadas
    this.toastr.success(
      `🏆 ${achievement.title}`,
      'Conquista Desbloqueada!',
      {
        timeOut: 5000,
        progressBar: true,
        closeButton: true,
        positionClass: 'toast-top-center',
        enableHtml: true
      }
    );
  }

  playNotificationSound(): void {
    try {
      const audio = new Audio('sounds/notification-achievement-unlocked.mp3');
      audio.volume = 0.5; // Volume a 50%
      audio.play().catch(error => {
        console.log('Erro ao tocar som:', error);
      });
    } catch (error) {
      console.log('Erro ao carregar áudio:', error);
    }
  }

  distributeAchievements(): void {
    // Primeiros 5 vão para a prateleira de cima
    this.topShelfAchievements = this.achievements.slice(0, 5);
    // Próximos 5 vão para a prateleira de baixo
    this.bottomShelfAchievements = this.achievements.slice(5, 10);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }
}
