import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';
import { AuthenticationService } from './services/authentication.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { HeaderComponent } from './shared/header/header.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'timetracker';
  showHeader: boolean = true;

  authChecked = toSignal(
    this.authService.getAuthChecked(),
    { initialValue: false }
  );

  constructor(private router: Router, private authService: AuthenticationService) {
    // Überprüfen der Route bei jeder Navigation
    this.router.events.subscribe((event) => {
      //Jedes Mal, wenn eine Navigation abgeschlossen wird (NavigationEnd),
      // prüft Angular die finale URL (event.urlAfterRedirects).
      if (event instanceof NavigationEnd) {
        //Wenn die finale URL /login ist, wird showHeader auf false gesetzt und der Header ausgeblendet.
        this.showHeader = event.urlAfterRedirects !== '/login';
      }
    });
  }
}
