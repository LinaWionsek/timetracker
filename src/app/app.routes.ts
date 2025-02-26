import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { TimeLogsComponent } from './time-logs/time-logs.component';

export const routes: Routes = [
    { path: 'overview', component: MainComponent },
    { path: 'logs', component: TimeLogsComponent },
    { path: '', redirectTo: '/overview', pathMatch: 'full' }
];
