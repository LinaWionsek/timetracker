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
  timerecords: Timerecords[] = [
    {
      date: '',
      day: 'Monday',
      startTime: '',
      endTime: '',
      breakMinutes: 0,
    },
    {
      date: '',
      day: 'Tuesday',
      startTime: '',
      endTime: '',
      breakMinutes: 0,
    },
    {
      date: '',
      day: 'Wednesday',
      startTime: '',
      endTime: '',
      breakMinutes: 0,
    },
    {
      date: '',
      day: 'Thursday',
      startTime: '',
      endTime: '',
      breakMinutes: 0,
    },
    {
      date: '',
      day: 'Friday',
      startTime: '',
      endTime: '',
      breakMinutes: 0,
    },
    {
      date: '',
      day: 'Saturday',
      startTime: '',
      endTime: '',
      breakMinutes: 0,
    },
    {
      date: '',
      day: 'Sunday',
      startTime: '',
      endTime: '',
      breakMinutes: 0,
    },
  ];

  startTime: string | null = null;
  endTime: string | null = null;
  selectedDate: Date = new Date(); // Setzt heutiges Datum
  currentWeekday: Timerecords | null = null;
  calculationFinished: boolean = false;

  //toast
  isVisible: boolean = false;
  duration: number = 2000;

  constructor() {
    this.onDateChange(); // Initialize with current date

  }


  safeDay(currentWeekday: Timerecords) {
    this.dataStoreService.safeData(currentWeekday);
    this.calculationFinished = false;
    this.showToast()
  }

  showToast() {
    this.isVisible = true;
    this.duration = 2000;
    setTimeout(() => {
      this.isVisible = false;
    }, this.duration || 2000);
  }

  onDateChange() {
    if (this.selectedDate) {
      const dayIndex = this.selectedDate.getDay();
      // Konvertiere von Sonntag=0 zu Montag=0
      const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      // Kopiere den Wochentag und setze das neue Datum
      const dateString = this.selectedDate.toISOString();
      this.currentWeekday = { ...this.timerecords[adjustedIndex], date: dateString };


    }
  }

  dateFilter = (date: Date | null): boolean => {
    const day = (date || new Date()).getDay();
    // 0 = Sonntag, 6 = Samstag
    return day !== 0 && day !== 6;
  };

  setCalculationToFalse() {
    this.calculationFinished = false
  }
  setStartTime(time: string, weekday: Timerecords) {
    weekday.startTime = time;
    this.calculationFinished = false;
  }

  setEndTime(time: string, weekday: Timerecords) {
    weekday.endTime = time;
    this.calculationFinished = false;
  }

  setBreak(duration: number, weekday: Timerecords) {
    weekday.breakMinutes = duration;
    this.calculationFinished = false;
  }

  calculateTime(weekday: Timerecords) {
    if (!weekday.startTime || !weekday.endTime) {
      weekday.timeWorked = 'Please enter both start and end times!';
      return;
    }

    // Convert input and standard times to Date objects
    const start = new Date(`1970-01-01T${weekday.startTime}:00`);
    const end = new Date(`1970-01-01T${weekday.endTime}:00`);

    // Calculate total working time in minutes
    const workingTimeInMinutes = differenceInMinutes(end, start);

    if (workingTimeInMinutes < 0) {
      weekday.timeWorked = 'End time cannot be earlier than start time!';
      return;
    }

    const timeWithoutBreak = workingTimeInMinutes;
    // Convert working time to hours and minutes
    const whours = Math.floor(timeWithoutBreak / 60);
    const wminutes = timeWithoutBreak % 60;
    weekday.timeWithoutBreak = `${whours} hours and ${wminutes} minutes`;
    // weekday.totalMinutes = timeWithoutBreak;


    const actualWorkingTime = workingTimeInMinutes - (weekday.breakMinutes || 0);

    // Convert working time to hours and minutes
    const thours = Math.floor(actualWorkingTime / 60);
    const tminutes = actualWorkingTime % 60;
    weekday.timeWorked = `${thours} hours and ${tminutes} minutes`;
    weekday.totalMinutes = actualWorkingTime;

    this.calculationFinished = true;
  }



}
