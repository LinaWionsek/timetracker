import { Component, inject } from '@angular/core';
import { Timerecords } from '../models/timerecords.class';
import { MatDialogRef } from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';
import { TimeRecordFormComponent } from '../time-record-form/time-record-form.component';
@Component({
  selector: 'app-dialog-edit-record',
  standalone: true,
  imports: [TimeRecordFormComponent, MatDialogModule],
  templateUrl: './dialog-edit-record.component.html',
  styleUrl: './dialog-edit-record.component.scss'
})
export class DialogEditRecordComponent {
  timerecord!: Timerecords; // vom Parent übergeben

  constructor(
    public dialogRef: MatDialogRef<DialogEditRecordComponent>,
    // private dataStoreService: DataStoreServiceService
  ) {}


  onFormCancel() {
    // hier den Dialog schließen
    this.dialogRef.close();
  }
}
