import { Component, inject } from '@angular/core';
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
import { Timerecords } from '../models/timerecords.class';
import { DataStoreServiceService } from '../services/data-store-service.service';
import { LastRecordsComponent } from '../last-records/last-records.component';


@Component({
  selector: 'app-main',
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
    LastRecordsComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {

  dataStoreService = inject(DataStoreServiceService);

  // Standard working hours for each weekday



  startTime: string | null = null;
  endTime: string | null = null;
  selectedDate: Date = new Date(); // Setzt heutiges Datum
  // currentWeekday: Timerecords | null = null;
  // record: Timerecords = new Timerecords();
  record!: Timerecords;
  calculationFinished: boolean = false;

  //toast
  isVisible: boolean = false;
  duration: number = 2000;

  constructor() {
    this.onDateChange(); // Initialize with current date
  }

  timerecords: Timerecords[] = [
    new Timerecords()
  ];

  safeDay() {
    console.log(this.record, 'currentWeekday')
    if (this.record) {
      this.dataStoreService.safeData(this.record);
      this.calculationFinished = false;
      this.showToast()
    }
  }

  showToast() {
    this.isVisible = true;
    this.duration = 2000;
    setTimeout(() => {
      this.isVisible = false;
    }, this.duration || 2000);
  }

  onDateChange() {
  
    this.record = new Timerecords({
      date: this.selectedDate.getTime(),
      day: format(this.selectedDate, 'EEEE')
  });
  
  this.calculationFinished = false;
    this.calculationFinished = false;

  }


  setCalculationToFalse() {
    this.calculationFinished = false
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

    // Convert input and standard times to Date objects
    const start = new Date(`1970-01-01T${this.record.startTime}:00`);
    const end = new Date(`1970-01-01T${this.record.endTime}:00`);

    // Calculate total working time in minutes
    const workingTimeInMinutes = differenceInMinutes(end, start);

    if (workingTimeInMinutes < 0) {
      this.record.timeWorked = 'End time cannot be earlier than start time!';
      return;
    }

    const timeWithoutBreak = workingTimeInMinutes;
    // Convert working time to hours and minutes
    const whours = Math.floor(timeWithoutBreak / 60);
    const wminutes = timeWithoutBreak % 60;
    this.record.timeWithoutBreak = `${whours} hours and ${wminutes} minutes`;
    // weekday.totalMinutes = timeWithoutBreak;


    const actualWorkingTime = workingTimeInMinutes - (this.record.breakMinutes || 0);

    // Convert working time to hours and minutes
    const thours = Math.floor(actualWorkingTime / 60);
    const tminutes = actualWorkingTime % 60;
    this.record.timeWorked = `${thours} hours and ${tminutes} minutes`;
    this.record.totalMinutes = actualWorkingTime;

    this.calculationFinished = true;
  }



}
