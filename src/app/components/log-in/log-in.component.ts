import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '@angular/fire/auth';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { AuthenticationService } from '../../services/authentication.service';
import { ToastComponent } from '../../toast/toast.component';
import { ToastService } from '../../services/toast.service';
@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ToastComponent
],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss'
})
export class LogInComponent {
 
  email: string = '';
  password: string = '';
  loginFailed: boolean = false;

  _isPasswordVisible: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    // public passwordVisibilityService: PasswordVisibilityService,
    private toastService: ToastService,
    private auth: Auth
    // private afAuth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.loginFailed = false;
    // this.passwordVisibilityService.resetPasswordVisibility();
  }

  togglePasswordInputType(): void {
    this._isPasswordVisible = !this._isPasswordVisible;
  }

  resetPasswordVisibility(): void {
    this._isPasswordVisible = false;
  }
  navigateToMainPage() {
    this.router.navigate(['/time-tracking']);
  }

  togglePassword(): void {
    this.togglePasswordInputType();
  }

  onEnter(event: Event){
    const keyboardEvent = event as KeyboardEvent;
    event.preventDefault();
    this.signIn();
  }

  signIn(): void {
    this.authService
      .signIn(this.email, this.password)
      .then(() => {
        this.toastService.showToast('Login erfolgreich!');
        console.log('Login erfolgreich!');
        this.email = '';
        this.password = '';
        
        setTimeout(() => {
          this.navigateToMainPage();
        }, 1000);
      })
      .catch((error) => {
        this.showLoginError();
        console.error(error);
      });
  }

  showLoginError(): void {
    this.loginFailed = true;
    console.log('loginFailed:', this.loginFailed);
    setTimeout(() => {
      this.loginFailed = false;
    }, 5000);
  }


}
