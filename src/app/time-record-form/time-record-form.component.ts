import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { differenceInMinutes, format } from 'date-fns';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogRef } from '@angular/material/dialog';

import { DialogEditRecordComponent } from '../dialog-edit-record/dialog-edit-record.component';
import { Timerecords } from '../models/timerecords.class';
import { DataStoreServiceService } from '../services/data-store-service.service';
import { Subscription } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { User } from '../models/user.class';

@Component({
  selector: 'app-time-record-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatMenuModule,
  ],
  templateUrl: './time-record-form.component.html',
  styleUrl: './time-record-form.component.scss'
})
export class TimeRecordFormComponent {
  @Input() existingRecord!: Timerecords;
  @Output() close = new EventEmitter<void>();

  // Wechselt zwischen "Create" und "Edit"  
  isEditMode: boolean = false;

  // Dein Timerecord
  record: Timerecords = new Timerecords();
  selectedDate: Date = new Date();
  calculationFinished: boolean = false;

  // Toast
  isVisible: boolean = false;
  duration: number = 2000;

  dataStoreService = inject(DataStoreServiceService);
  authService = inject(AuthenticationService);
  authSubscription: Subscription | null = null;
  user: User | null = null;


  closeDialog() {
    // Bei Klick nur das Output-Event emitten
    this.close.emit();
  }

  ngOnInit() {

    this.authSubscription = this.authService.getUserStatus().subscribe(
      (user) => {
        this.user = user;
        if (this.user) {
          // Prüfen, ob eine bestehende "Record" reinkommt
          if (this.existingRecord && this.existingRecord.id) {
            // → Wir sind im Edit-Mode
            this.isEditMode = true;
            // Kopie davon anlegen, damit wir "Original" nicht überschreiben
            this.record = new Timerecords(this.existingRecord);
            this.selectedDate = new Date(this.record.date);
          } else {
            // → Create-Modus
            this.setRecordDateAndCreator(); // initialisiert: Tag etc.
          }
        }
        console.log('user tracked', this.user);
      },
      (error) => console.error('Fehler beim Überwachen des Auth-Status:', error)
    );

    // this.userService.user$.subscribe((user) => {
    //   if (user) {
    //     this.user = user;
    //   }
    // });


    // // Prüfen, ob eine bestehende "Record" reinkommt
    // if (this.existingRecord && this.existingRecord.id) {
    //   // → Wir sind im Edit-Mode
    //   this.isEditMode = true;
    //   // Kopie davon anlegen, damit wir "Original" nicht überschreiben
    //   this.record = new Timerecords(this.existingRecord);
    //   this.selectedDate = new Date(this.record.date);
    // } else {
    //   // → Create-Modus
    //   this.onDateChange(); // initialisiert: Tag etc.
    // }




  }

  onSaveClick() {
    // Speichern oder Updaten
    if (this.isEditMode && this.record.id) {
      // Hier würdest du dein Update aufrufen → z.B. "this.dataStoreService.updateData(this.record);"
      console.log(`Update record with ID: ${this.record.id}`);
      // TODO: Implementiere updateData, falls noch nicht vorhanden
      this.dataStoreService.updateData(this.record);
    } else {
      // Neu anlegen
      console.log(this.record)
      this.dataStoreService.safeData(this.record)
        .then(() => {
          console.log('Erfolgreich neu angelegt');
        })
        .catch(err => console.error('Fehler', err));
    }

    this.showToast();
    this.calculationFinished = false;
    setTimeout(() => {
      this.closeDialog();
    }, this.duration || 2000);

  }

  showToast() {
    this.isVisible = true;
    setTimeout(() => {
      this.isVisible = false;
    }, this.duration || 2000);
  }


  // ----------------------------
  // Calculation, co
  // ----------------------------

  setRecordDateAndCreator() {
    // Nur Datum & Wochentag updaten, keinen Reset der ganzen record
    this.record.date = this.selectedDate.getTime();
    this.record.day = format(this.selectedDate, 'EEEE');
    if(this.user){
      this.record.createdBy = this.user?.lastName + ', ' + this.user?.firstName;
    }
   
  }

  setCalculationToFalse() {
    this.calculationFinished = false;
  }

  setStartTime(time: string) {
    this.record.startTime = time;
    this.calculationFinished = false;
  }

  setEndTime(time: string) {
    this.record.endTime = time;
    this.calculationFinished = false;
  }

  setBreak(duration: number) {
    this.record.breakMinutes = duration;
    this.calculationFinished = false;
  }

  calculateTime() {
    if (!this.record.startTime || !this.record.endTime) {
      this.record.timeWorked = 'Please enter both start and end times!';
      return;
    }

    const start = new Date(`1970-01-01T${this.record.startTime}:00`);
    const end = new Date(`1970-01-01T${this.record.endTime}:00`);
    const workingTimeInMinutes = differenceInMinutes(end, start);

    if (workingTimeInMinutes < 0) {
      this.record.timeWorked = 'End time cannot be earlier than start time!';
      return;
    }

    const timeWithoutBreak = workingTimeInMinutes;
    const whours = Math.floor(timeWithoutBreak / 60);
    const wminutes = timeWithoutBreak % 60;
    this.record.timeWithoutBreak = `${whours} hours and ${wminutes} minutes`;

    const actualWorkingTime = workingTimeInMinutes - (this.record.breakMinutes || 0);
    const thours = Math.floor(actualWorkingTime / 60);
    const tminutes = actualWorkingTime % 60;
    this.record.timeWorked = `${thours} hours and ${tminutes} minutes`;
    this.record.totalMinutes = actualWorkingTime;

    this.calculationFinished = true;
  }




}
