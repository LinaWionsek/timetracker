import { Component, inject } from '@angular/core';
import { Timerecords } from '../models/timerecords.class';
import { MatDialogRef } from '@angular/material/dialog';
import {MatDialogModule} from '@angular/material/dialog';
import { DataStoreServiceService } from '../services/data-store-service.service';
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
    private dataStoreService: DataStoreServiceService
  ) {}

  onRecordSaved(record: Timerecords) {
    // Hier "Update" durchführen (falls du es schon implementiert hast)
    if (record.id) {
      // updateDoc in Firestore ...
      // dataStoreService.updateData(record);
      console.log('Record updated:', record);
    } else {
      // Falls kein id → neu anlegen
      this.dataStoreService.safeData(record);
      console.log('Record created:', record);
    }

    // Dialog schließen
    this.dialogRef.close();
  }


  onFormCancel() {
    // hier den Dialog schließen
    this.dialogRef.close();
  }
}
