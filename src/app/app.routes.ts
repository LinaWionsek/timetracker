import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { TimeLogsComponent } from './time-logs/time-logs.component';

export const routes: Routes = [
    { path: 'time-tracking', component: MainComponent },
    { path: 'time-overview', component: TimeLogsComponent },
    { path: '', redirectTo: '/time-tracking', pathMatch: 'full' }
];
