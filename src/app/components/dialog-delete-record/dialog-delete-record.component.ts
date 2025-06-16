import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timerecords } from '../../models/timerecords.class';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog-delete-record',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './dialog-delete-record.component.html',
  styleUrl: './dialog-delete-record.component.scss'
})
export class DialogDeleteRecordComponent {
  timerecord!: Timerecords; // vom Parent übergeben
  
  constructor(
    public dialogRef: MatDialogRef<DialogDeleteRecordComponent>,
  ) { }

  onNoClick(): void {
    // Benutzer klickt auf "Abbrechen"
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    // Benutzer klickt auf "Löschen"
    this.dialogRef.close(true);
  }
}
