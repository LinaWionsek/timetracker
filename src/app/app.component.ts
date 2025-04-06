import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'timetracker';
  showHeader: boolean = true;

  constructor(private router: Router) {
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
