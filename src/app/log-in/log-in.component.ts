import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService  } from '../services/authentication.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { AuthHeaderComponent } from '../auth-header/auth-header.component';
// import { PasswordVisibilityService } from '../../services/password-visibility.service';
// import { ToastService } from '../../services/toast.service';
// import { ToastComponent } from '../../shared-components/toast/toast.component';
// import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { User } from '../models/user.class';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ 
    CommonModule,
    FormsModule,
    // AuthHeaderComponent,
    FormsModule,
    CommonModule,
    // ToastComponent,
    RouterModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule],
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
    // private toastService: ToastService,
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
        // this.toastService.showToast('Login erfolgreich!');
        console.log('Login erfolgreich!');
        this.email = '';
        this.password = '';

        setTimeout(() => {
          this.navigateToMainPage();
          // this.authService.setOnlineStatus(true);
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

  

  // async loginWithGoogle(): Promise<void> {
  //   let provider = new GoogleAuthProvider();

  //   try {
  //     let result = await this.afAuth.signInWithPopup(provider);
  //     let user = result.user;

  //     if (!user) {
  //       throw new Error('Kein Benutzer-Datenobjekt gefunden.');
  //     }

  //     const fullName = user.displayName || '';
  //     const [firstName, ...lastNameParts] = fullName.trim().split(' ');
  //     const lastName = lastNameParts.join(' ');

  //     const userData: User = new User({
  //       id: user.uid,
  //       firstName: firstName,
  //       lastName: lastName,
  //       email: user.email || '',
  //       avatar: 'assets/img/avatar_empty.png',
  //       isOnline: true,
  //     });

  //     // this.toastService.showToast('Google Login erfolgreich!');
  //     await this.authService.saveUserData(user.uid, userData.toPlainObject());
  //     this.authService.setOnlineStatus(true);

  //     setTimeout(() => {
  //       this.navigateToMainPage();
  //     }, 1000);
  //   } catch (error) {
  //     console.error('Fehler beim Verarbeiten der Benutzerdaten:', error);
  //   }
  // }


}
