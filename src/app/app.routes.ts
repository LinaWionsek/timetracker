import { Routes } from '@angular/router';
import { MainComponent } from './components/main/main.component';
import { authGuard } from './guards/auth.guard';
import { dataLoadedGuard } from './guards/data-loaded.guard';
import { LogInComponent } from './components/log-in/log-in.component';
import { TimeLogsComponent } from './components/time-logs/time-logs.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LogInComponent },
    { path: 'time-tracking', component: MainComponent, canActivate: [authGuard] },
    { path: 'time-overview', component: TimeLogsComponent, canActivate: [authGuard, dataLoadedGuard] }, 
  
   
];
