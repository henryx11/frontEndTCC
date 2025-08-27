import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SidebarComponent} from './components/sidebar/sidebar.component';
//import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
//import { faCoffee } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'login_page';
  //faCoffee = faCoffee;
}


