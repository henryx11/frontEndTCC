import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { EditProfileModalComponent } from '../edit-profile-modal/edit-profile-modal.component';
import { UserService } from '../../services/user.service';
import { UserInfoService, UserInfo } from '../../services/user-info.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FontAwesomeModule, CommonModule, EditProfileModalComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  faArrowLeft = faArrowLeft;
  userName: string | null = null;
  modalEditarPerfilAberto: boolean = false;
  isAdmin: boolean = false;
  userRank: string = 'BRONZE';
  medalImage: string = 'medalha_bronze.png';

  constructor(
    private router: Router,
    private userService: UserService,
    private userInfoService: UserInfoService
  ) {
    this.carregarDadosUsuario();
  }

  ngOnInit(): void {
    this.loadUserInfo();
  }

  /**
   * Carrega os dados do usuário do token
   */
  carregarDadosUsuario(): void {
    const userInfo = this.userService.getUserInfo();
    this.userName = userInfo?.name || null;
  }

  /**
   * Carrega informações completas do usuário (rank, xp, etc.)
   */
  loadUserInfo(): void {
    this.userInfoService.getCurrentUserInfo().subscribe({
      next: (userInfo: UserInfo) => {
        this.userRank = userInfo.rank;
        this.medalImage = this.userInfoService.getMedalImage(userInfo.rank);
        // Atualiza o nome também se disponível
        if (userInfo.name) {
          this.userName = userInfo.name;
        }
        // Verifica se é admin baseado nas authorities
        if (userInfo.authorities) {
          this.isAdmin = userInfo.authorities.some(auth => auth.authority === 'ROLE_ADMIN');
        }
      },
      error: (error) => {
        console.error('Erro ao carregar informações do usuário:', error);
        // Em caso de erro, usa valores padrão
        this.medalImage = this.userInfoService.getMedalImage('BRONZE');
      }
    });
  }

  goToAccounts(): void {
    this.router.navigate(['/accounts-list']);
  }

  goToCreateAccount(): void {
    this.router.navigate(['/create-account']);
  }

  goToDashboard(): void {
    if (this.isAdmin) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.router.navigate(['/main-page']);
    }
  }

  goToCreditCard(): void {
    this.router.navigate(['/credit-card']);
  }

  goToMissions(): void {
    this.router.navigate(['/missions']);
  }

  goToAchivements(): void {
    this.router.navigate(['/achievements']);
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Abre o modal de editar perfil
   */
  abrirModalEditarPerfil(): void {
    this.modalEditarPerfilAberto = true;
  }

  /**
   * Fecha o modal de editar perfil
   */
  fecharModalEditarPerfil(): void {
    this.modalEditarPerfilAberto = false;
  }

  /**
   * Callback quando o perfil é atualizado
   */
  onPerfilAtualizado(): void {
    this.modalEditarPerfilAberto = false;
    setTimeout(() => {
      this.carregarDadosUsuario();
      this.loadUserInfo();
    }, 100);
  }
}
