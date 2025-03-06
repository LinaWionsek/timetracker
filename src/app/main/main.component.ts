import { Component } from '@angular/core';
import { LastRecordsComponent } from '../last-records/last-records.component';
import { TimeRecordFormComponent } from '../time-record-form/time-record-form.component';


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    LastRecordsComponent,
    TimeRecordFormComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

}
