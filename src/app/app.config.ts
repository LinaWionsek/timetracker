import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),   provideAnimations(), provideNativeDateAdapter(), {provide: MAT_DATE_LOCALE, useValue: 'en-GB'}, provideAnimationsAsync(), importProvidersFrom(provideFirebaseApp(() => initializeApp({ "projectId": "timetracker-5e944", "appId": "1:426476596021:web:c5056a4f0338303cbe3a7c", "storageBucket": "timetracker-5e944.firebasestorage.app", "apiKey": "AIzaSyA-WZ0GV-jtVksH_7sVlUnZdLE78zh191o", "authDomain": "timetracker-5e944.firebaseapp.com", "messagingSenderId": "426476596021" }))), importProvidersFrom(provideAuth(() => getAuth())), importProvidersFrom(provideFirestore(() => getFirestore()))]
};
