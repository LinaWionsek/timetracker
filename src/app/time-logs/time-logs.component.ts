import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Timerecords } from '../models/timerecords.class';
import { DataStoreServiceService } from '../services/data-store-service.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ViewChild, inject } from '@angular/core';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { 
  startOfWeek, endOfWeek, format, 
  startOfMonth, endOfMonth, eachWeekOfInterval, isSameMonth,
  isWithinInterval, getISOWeek, addDays, getDay
} from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditRecordComponent } from '../dialog-edit-record/dialog-edit-record.component';
import { DialogDeleteRecordComponent } from '../dialog-delete-record/dialog-delete-record.component';

interface WeeklyData {
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  weekStartDate: Date;
  weekEndDate: Date;
  totalMinutes: number;
  targetMinutes: number;
  differenceMinutes: number;
  actualHours: string;
  targetHours: string;
  difference: string;
  workdaysInMonth: number;
}

@Component({
  selector: 'app-time-logs',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatSortModule, MatIconModule, MatButtonModule],
  templateUrl: './time-logs.component.html',
  styleUrl: './time-logs.component.scss'
})
export class TimeLogsComponent {
  private _liveAnnouncer = inject(LiveAnnouncer);
  dataStoreService = inject(DataStoreServiceService);
  allTimerecords: Timerecords[] = [];
  displayedColumns: string[] = ['date', 'day', 'time', 'duration', 'break', 'by', 'at', 'edit'];

  weeklyDisplayedColumns: string[] = ['weekRange', 'actualHours', 'targetHours', 'difference'];
  weeklyDataSource = new MatTableDataSource<WeeklyData>([]);
  
  // Aktuelles Datum für Monatsnavigation
  currentMonth: Date = new Date();
  
  // Vertraglich vereinbarte Wochenarbeitszeit in Minuten (40 Stunden)
  contractWeeklyMinutes: number = 36 * 60;
  
  // Anzahl der Arbeitstage pro Woche (Mo-Fr)
  workdaysPerWeek: number = 5;
  
  // Tägliche Sollarbeitszeit in Minuten (berechnet aus vertraglicher Wochenarbeitszeit)
  get dailyTargetMinutes(): number {
    return this.contractWeeklyMinutes / this.workdaysPerWeek;
  }

  dialog = inject(MatDialog);
  dataSource = new MatTableDataSource(this.allTimerecords);

  @ViewChild('detailSort') detailSort!: MatSort;
  @ViewChild('weeklySort') weeklySort!: MatSort;

  ngOnInit() {
    this.dataStoreService.getTimerecords();
    this.dataStoreService.timerecords$.subscribe((changes) => {
      this.allTimerecords = changes.map(record =>
        Timerecords.fromJSON({
          ...record,
          date: typeof record.date === 'number' ? record.date : Number(record.date),
          createdAt: typeof record.createdAt === 'number' ? record.createdAt : Number(record.createdAt)
        })
      );

      this.dataSource.data = this.allTimerecords;
      this.updateWeeklyData();
    });
  }

  previousMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.updateWeeklyData();
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.updateWeeklyData();
  }

  updateWeeklyData() {
    const monthlyWeeklyData = this.getMonthlyWeeklyData(this.currentMonth, this.allTimerecords);
    this.weeklyDataSource.data = monthlyWeeklyData;
  }

  // Prüft, ob ein Tag ein Arbeitstag ist (Mo-Fr)
  isWorkday(date: Date): boolean {
    const day = getDay(date);
    // 0 = Sonntag, 1-5 = Mo-Fr, 6 = Samstag
    return day >= 1 && day <= 5;
  }

  getMonthlyWeeklyData(month: Date, records: Timerecords[]): WeeklyData[] {
    // Start- und Enddatum des Monats
    const firstDayOfMonth = startOfMonth(month);
    const lastDayOfMonth = endOfMonth(month);
    
    // Alle Wochen im Monat ermitteln
    const weeksInMonth = eachWeekOfInterval(
      { start: firstDayOfMonth, end: lastDayOfMonth },
      { weekStartsOn: 1 } // Woche beginnt am Montag
    );
    
    return weeksInMonth.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      // Berechnen der Arbeitstage dieser Woche, die im aktuellen Monat liegen
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
      
      // Filter nur Arbeitstage (Mo-Fr) im aktuellen Monat
      const workdaysInMonth = weekDays.filter(day => 
        this.isWorkday(day) && isSameMonth(day, month)
      ).length;
      
      // Wochen-Soll für diesen Monat = Tägliche Sollzeit * Anzahl Arbeitstage im Monat
      const targetMinutes = workdaysInMonth * this.dailyTargetMinutes;
      
      // Einträge für diese Woche finden, die im aktuellen Monat liegen
      const weekRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        return isWithinInterval(recordDate, { start: weekStart, end: weekEnd }) && 
               isSameMonth(recordDate, month);
      });
      
      // Summe der Arbeitsminuten berechnen
      let totalMinutes = 0;
      weekRecords.forEach(record => {
        let minutes = record.totalMinutes;
        if (!minutes && record.timeWorked) {
          const [hours, mins] = record.timeWorked.split(':').map(Number);
          minutes = hours * 60 + mins;
        }
        totalMinutes += (minutes || 0);
      });
      
      // Differenz berechnen
      const differenceMinutes = totalMinutes - targetMinutes;
      
      return {
        weekNumber: getISOWeek(weekStart),
        weekStart: format(weekStart, 'dd.MM.yyyy'),
        weekEnd: format(weekEnd, 'dd.MM.yyyy'),
        weekStartDate: weekStart,
        weekEndDate: weekEnd,
        totalMinutes,
        targetMinutes,
        differenceMinutes,
        actualHours: this.minutesToTimeString(totalMinutes),
        targetHours: this.minutesToTimeString(targetMinutes),
        difference: this.minutesToDifferenceString(differenceMinutes),
        workdaysInMonth
      };
    });
  }

  // Hilfsfunktion: Minuten in Zeitstring umwandeln
  minutesToTimeString(minutes: number): string {
    return `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, '0')}`;
  }

  // Hilfsfunktion: Minuten in Differenzstring umwandeln
  minutesToDifferenceString(minutes: number): string {
    const isNegative = minutes < 0;
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    return `${isNegative ? '-' : '+'}${hours}:${mins.toString().padStart(2, '0')}`;
  }
  // Berechnungen für die Fußzeile
  calculateTotalActualHours(): string {
    const totalMinutes = this.weeklyDataSource.data.reduce((acc, week) => acc + week.totalMinutes, 0);
    return this.minutesToTimeString(totalMinutes);
  }

  calculateTotalTargetHours(): string {
    const totalMinutes = this.weeklyDataSource.data.reduce((acc, week) => acc + week.targetMinutes, 0);
    return this.minutesToTimeString(totalMinutes);
  }

  calculateTotalDifferenceMinutes(): number {
    return this.weeklyDataSource.data.reduce((acc, week) => acc + week.differenceMinutes, 0);
  }

  calculateTotalDifference(): string {
    return this.minutesToDifferenceString(this.calculateTotalDifferenceMinutes());
  }

  calculateTotalWorkdays(): number {
    return this.weeklyDataSource.data.reduce((acc, week) => acc + week.workdaysInMonth, 0);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.detailSort;
    this.weeklyDataSource.sort = this.weeklySort;

    this.weeklyDataSource.sortingDataAccessor = (item, property) => {
      if (property === 'weekRange') {
        return item.weekStartDate.getTime();
      } else if (property === 'actualHours') {
        return item.totalMinutes;
      } else if (property === 'targetHours') {
        return item.targetMinutes;
      } else if (property === 'difference') {
        return item.differenceMinutes;
      }
      // Typensichere Lösung ohne string-indizierung
      return 0;
    };
    
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'date': return item.date;
        case 'time': return item.startTime;
        case 'break': return item.breakMinutes;
        case 'duration': return item.timeWorked;
        case 'by': return item.createdBy;
        case 'at': return item.createdAt;
        default: return '';
      }
    };
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  edit(timerecord: Timerecords) {
    const dialog = this.dialog.open(DialogEditRecordComponent);
    dialog.componentInstance.timerecord = new Timerecords(timerecord);
    dialog.afterClosed().subscribe(() => {
      this.updateWeeklyData();
    });
  }

  delete(timerecord: Timerecords) {
    const dialog = this.dialog.open(DialogDeleteRecordComponent);
    dialog.componentInstance.timerecord = new Timerecords(timerecord);
    dialog.afterClosed().subscribe(result => {
      if (result === true) {
        this.dataStoreService.deleteTimerecord(timerecord);
        this.updateWeeklyData();
      }
    });
  }
}