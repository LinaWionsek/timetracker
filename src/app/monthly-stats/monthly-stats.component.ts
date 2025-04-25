import { Component, inject, Input, ViewChild, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../models/user.class';
import { Timerecords } from '../models/timerecords.class';
import { addDays, eachWeekOfInterval, endOfMonth, endOfWeek, format, getDay, getISOWeek, isSameMonth, isWithinInterval, startOfMonth } from 'date-fns';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatIconModule } from '@angular/material/icon';


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
  selector: 'app-monthly-stats',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTableModule, MatSortModule],
  templateUrl: './monthly-stats.component.html',
  styleUrl: './monthly-stats.component.scss'
})
export class MonthlyStatsComponent {
  @Input() user!: User;
  @Input() records: Timerecords[] = [];


  private _liveAnnouncer = inject(LiveAnnouncer);
  // dataStoreService = inject(DataStoreServiceService);
  // allTimerecords: Timerecords[] = [];
  // displayedColumns: string[] = ['date', 'day', 'time', 'duration', 'break', 'by', 'at', 'edit'];
  weeklyDisplayedColumns: string[] = ['weekRange', 'actualHours', 'targetHours', 'difference'];
  weeklyDataSource = new MatTableDataSource<WeeklyData>([]);
  // user: User | null = null;
  allUsers: User[] = [];
  // Kumulativer Stundensaldo (über alle Monate)
  cumulativeDifferenceMinutes: number = 0;

  // Aktuelles Datum für Monatsnavigation
  currentMonth: Date = new Date();

  contractWeeklyHours: number = 0;
  // Vertraglich vereinbarte Wochenarbeitszeit in Minuten (40 Stunden)
  get contractWeeklyMinutes(): number {
    return this.contractWeeklyHours * 60;
  }
  // Anzahl der Arbeitstage pro Woche (Mo-Fr)
  workdaysPerWeek: number = 5;

  // Tägliche Sollarbeitszeit in Minuten (berechnet aus vertraglicher Wochenarbeitszeit)
  get dailyTargetMinutes(): number {
    return this.contractWeeklyMinutes / this.workdaysPerWeek;
  }

  dialog = inject(MatDialog);
  @ViewChild('weeklySort') weeklySort!: MatSort;
  // authSubscription: Subscription | null = null;

  // selectedUserId: string | null = null;
  // selectedUser: User | null = null;

  // constructor(private authService: AuthenticationService) { }
  ngOnInit() {
      // Setze den aktuellen Monat auf den aktuellen Monat oder den nächsten mit Einträgen
      if (!this.hasEntriesInMonth(this.currentMonth)) {
        const currentMonth = new Date();
        if (this.hasEntriesInMonth(currentMonth)) {
          this.currentMonth = currentMonth;
        } else {
          // Suche nach dem nächsten Monat mit Einträgen
          const nextMonth = this.findNextMonthWithEntries(currentMonth);
          if (nextMonth) {
            this.currentMonth = nextMonth;
          } else {
            // Suche nach dem vorherigen Monat mit Einträgen
            const prevMonth = this.findPreviousMonthWithEntries(currentMonth);
            if (prevMonth) {
              this.currentMonth = prevMonth;
            }
          }
        }
      }
      this.contractWeeklyHours = this.user.weeklyWorkingHours;
      this.updateWeeklyData();
      this.calculateCumulativeDifference(); // Berechnet den Gesamtsaldo
      this.updateNavigationState(); // Aktualisiert den Zustand der Navigationsbuttons
    }

    
      
    ngOnChanges(changes: SimpleChanges) {
    if (changes['user']) {
      console.log('User hat sich geändert!', this.user);

      // WENN User sich ändert: Tabelle neu aufbauen
      this.contractWeeklyHours = this.user.weeklyWorkingHours;
      this.updateWeeklyData();
      this.calculateCumulativeDifference();
      this.updateNavigationState();
    }
    if (changes['records']) {
      console.log('Records geändert:', this.records);// falls records sich ändern (kann später wichtig werden)
      this.updateWeeklyData();
      this.calculateCumulativeDifference();
      this.updateNavigationState();
    }
  }

  


  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }
  previousMonth() {
    const prevMonth = this.findPreviousMonthWithEntries(this.currentMonth);
    if (prevMonth) {
      this.currentMonth = prevMonth;
      this.updateWeeklyData();
      this.updateNavigationState();
    }
  }

  nextMonth() {
    const nextMonth = this.findNextMonthWithEntries(this.currentMonth);
    if (nextMonth) {
      this.currentMonth = nextMonth;
      this.updateWeeklyData();
      this.updateNavigationState();
    }
  }

  // Aktualisiert den Zustand der Navigationsbuttons
  updateNavigationState() {
    this.hasPreviousMonth = !!this.findPreviousMonthWithEntries(this.currentMonth);
    this.hasNextMonth = !!this.findNextMonthWithEntries(this.currentMonth);
  }

  updateWeeklyData() {
    const recordsForUser = this.records.filter(record => record.createdById === this.user.id);
    const monthlyWeeklyData = this.getMonthlyWeeklyData(this.currentMonth, recordsForUser);
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
    // this.dataSource.sort = this.detailSort;
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
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  // Berechnet den Gesamtsaldo über alle Zeiteinträge hinweg
  calculateCumulativeDifference() {
    const allWorkdays = this.getAllWorkdaysSinceStart();
    const totalTargetMinutes = allWorkdays.length * this.dailyTargetMinutes;
    // Summe aller tatsächlich gearbeiteten Minuten
    let totalWorkedMinutes = 0;
    this.records.forEach(record => {
      let minutes = record.totalMinutes;
      if (!minutes && record.timeWorked) {
        const [hours, mins] = record.timeWorked.split(':').map(Number);
        minutes = hours * 60 + mins;
      }
      totalWorkedMinutes += (minutes || 0);
    });
    this.cumulativeDifferenceMinutes = totalWorkedMinutes - totalTargetMinutes;
  }

  // Ermittelt alle Arbeitstage seit Beginn der Zeiterfassung
  getAllWorkdaysSinceStart(): Date[] {
    if (this.records.length === 0) return [];

    // Frühestes und spätestes Datum finden
    const dates = this.records.map(r => new Date(r.date));
    const startDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const endDate = new Date(Math.max(...dates.map(d => d.getTime())));
    // Auf den ersten Tag des Monats setzen für Start
    const firstDay = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const lastDay = endDate;
    // Alle Arbeitstage im Zeitraum ermitteln
    const allWorkdays: Date[] = [];
    let currentDay = firstDay;
    while (currentDay <= lastDay) {
      if (this.isWorkday(currentDay)) {
        allWorkdays.push(new Date(currentDay));
      }
      currentDay = addDays(currentDay, 1);
    }
    return allWorkdays;
  }

  getCumulativeDifferenceString(): string {
    return this.minutesToDifferenceString(this.cumulativeDifferenceMinutes);
  }


  ///////////////////////Naviagtion////////////////////////////////////////


  // Prüft, ob ein bestimmter Monat Zeiteinträge enthält
  hasEntriesInMonth(month: Date): boolean {
    const firstDayOfMonth = startOfMonth(month);
    const lastDayOfMonth = endOfMonth(month);

    return this.records.some(record => {
      const recordDate = new Date(record.date);
      return recordDate >= firstDayOfMonth && recordDate <= lastDayOfMonth &&
        (record.totalMinutes > 0 || (record.timeWorked && record.timeWorked !== '0:00'));
    });
  }

  // Findet den nächsten Monat mit Einträgen
  findNextMonthWithEntries(startMonth: Date): Date | null {
    let nextMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() + 1, 1);

    // Suche bis zu 24 Monate in die Zukunft (als Sicherheit)
    for (let i = 0; i < 24; i++) {
      if (this.hasEntriesInMonth(nextMonth)) {
        return nextMonth;
      }
      nextMonth = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1);
    }

    return null; // Kein Monat mit Einträgen gefunden
  }

  // Findet den vorherigen Monat mit Einträgen
  findPreviousMonthWithEntries(startMonth: Date): Date | null {
    let prevMonth = new Date(startMonth.getFullYear(), startMonth.getMonth() - 1, 1);

    // Suche bis zu 24 Monate in die Vergangenheit (als Sicherheit)
    for (let i = 0; i < 24; i++) {
      if (this.hasEntriesInMonth(prevMonth)) {
        return prevMonth;
      }
      prevMonth = new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1);
    }

    return null; // Kein Monat mit Einträgen gefunden
  }

  // Properties für Button-Deaktivierung
  hasNextMonth: boolean = false;
  hasPreviousMonth: boolean = false;






}
