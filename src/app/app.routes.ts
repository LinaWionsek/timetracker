import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { TimeLogsComponent } from './time-logs/time-logs.component';
import { LogInComponent } from './log-in/log-in.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LogInComponent },
    { path: 'time-tracking', component: MainComponent },
    { path: 'time-overview', component: TimeLogsComponent }, 
  
   
];
