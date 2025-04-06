import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(  private authService: AuthenticationService,  private router: Router,) {}

  signOut(): void {
    this.authService.signOut();
    this.router.navigate(['/login']);
  }
 
}

