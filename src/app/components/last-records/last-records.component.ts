import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timerecords } from '../../models/timerecords.class';
import { DataStoreServiceService } from '../../services/data-store-service.service';
import { startOfWeek, format, endOfWeek } from 'date-fns';
import { MatIconModule } from '@angular/material/icon';
import { DialogEditRecordComponent } from '../dialog-edit-record/dialog-edit-record.component';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../models/user.class';
import { AuthenticationService } from '../../services/authentication.service';


@Component({
  selector: 'app-last-records',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './last-records.component.html',
  styleUrl: './last-records.component.scss'
})
export class LastRecordsComponent {
  dialog = inject(MatDialog);
  dataStoreService = inject(DataStoreServiceService);
  timerecord!: Timerecords;
  allTimerecords: Timerecords[] = [];
  //allTimerecords braucht kein $, weil es sich dabei um die konkreten Daten (ein normales Array) handelt und nicht um ein Observable.
  user: User | null = null;

  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
    this.authService.getUserStatus().subscribe(
      (user) => {
        this.user = user;
        if (this.user) {
          this.loadTimerecords();
        }
      },
      (error) => console.error('Fehler beim Überwachen des Auth-Status:', error)
    );

  }
  loadTimerecords() {
    this.dataStoreService.getTimerecords();
    this.dataStoreService.timerecords$.subscribe((changes) => {
      this.processTimerecords(changes);
    });
  }
  processTimerecords(changes: Timerecords[]) {
    if (!this.user) {
      console.warn('Kein Benutzer verfügbar');
      return;
    } else {
      // Prüfen, ob überhaupt Daten kommen
      if (!changes || changes.length === 0) {
        console.log('Keine Daten erhalten');
        return;
      }
      try {
        const user = this.user;
        const recordsForUser = changes.filter(record => record.createdById === user.id);
        this.allTimerecords = recordsForUser.map(record => this.mapTimerecord(record));
        this.sortTimeRecords();
        this.allTimerecords = this.allTimerecords.slice(0, 5);
      } catch (error) {
        console.error('Fehler bei der Verarbeitung:', error);
      }
    }

  }

  mapTimerecord(record: Timerecords) {
    const timerecord = Timerecords.fromJSON({
      ...record,
      date: typeof record.date === 'number' ? record.date : Number(record.date),
      createdAt: typeof record.createdAt === 'number' ? record.createdAt : Number(record.createdAt)
    });

    // set's id if it exists
    if (record.id) {
      timerecord.id = record.id;
    }

    return timerecord;
  }


  edit(timerecord: Timerecords) {
    const dialog = this.dialog.open(DialogEditRecordComponent);
    dialog.componentInstance.timerecord = new Timerecords(timerecord);
  }

  sortTimeRecords() {
    this.allTimerecords.sort((a, b) => b.date - a.date);
  }


  groupByWeek(records: Timerecords[]) {

    const weeks: { [key: string]: number } = {};

    records.forEach(record => {
      // Konvertiere Timestamp zu Date für date-fns Funktionen
      const weekStart = startOfWeek(new Date(record.date), { weekStartsOn: 1 });
      const weekKey = format(weekStart, 'yyyy-MM-dd');

      let minutes = record.totalMinutes;
      if (!minutes && record.timeWorked) {
        const [hours, mins] = record.timeWorked.split(':').map(Number);
        minutes = hours * 60 + mins;
      }
      weeks[weekKey] = (weeks[weekKey] || 0) + (minutes || 0);
    });

    return Object.entries(weeks).map(([date, minutes]) => ({
      weekStart: format(new Date(date), 'dd.MM.yyyy'),
      weekEnd: format(endOfWeek(new Date(date), { weekStartsOn: 1 }), 'dd.MM.yyyy'),
      totalHours: `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, '0')}`
    }));
  }










}
