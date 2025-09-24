import { Component } from '@angular/core';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-main-page',
  imports: [],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss'
})
export class MainPageComponent {

  constructor(private userService: UserService) {
  }
}
