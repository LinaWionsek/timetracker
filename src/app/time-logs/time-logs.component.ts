import { CommonModule, Time } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Timerecords } from '../models/timerecords.class';
import { DataStoreServiceService } from '../services/data-store-service.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, ViewChild, inject } from '@angular/core';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { startOfWeek, format, endOfWeek } from 'date-fns';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditRecordComponent } from '../dialog-edit-record/dialog-edit-record.component';
import { DialogDeleteRecordComponent } from '../dialog-delete-record/dialog-delete-record.component';

@Component({
  selector: 'app-time-logs',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatSortModule, MatIconModule],
  templateUrl: './time-logs.component.html',
  styleUrl: './time-logs.component.scss'
})
export class TimeLogsComponent {
  private _liveAnnouncer = inject(LiveAnnouncer);
  dataStoreService = inject(DataStoreServiceService);
  allTimerecords: Timerecords[] = [];
  displayedColumns: string[] = ['date', 'day', 'time', 'duration', 'break', 'by', 'at', 'edit'];

  weeklyDisplayedColumns: string[] = ['weekRange', 'totalHours'];
  weeklyDataSource = new MatTableDataSource<any>([]);

  dialog = inject(MatDialog);
  dataSource = new MatTableDataSource(this.allTimerecords);

  @ViewChild('detailSort') detailSort!: MatSort;
  @ViewChild('weeklySort') weeklySort!: MatSort;


  ngOnInit() {
    this.dataStoreService.getTimerecords();
    this.dataStoreService.timerecords$.subscribe((changes) => {
      console.log('Changes:', changes);

      this.allTimerecords = changes.map(record =>
        Timerecords.fromJSON({
          ...record,
          date: typeof record.date === 'number' ? record.date : Number(record.date),
          createdAt: typeof record.createdAt === 'number' ? record.createdAt : Number(record.createdAt)
        })
      );

      this.dataSource.data = this.allTimerecords;
      // this.sortTimeRecords();
      // Zeigt nur die ersten 5 Einträge an (schon sortiert durch sortTimeRecords)
      // this.allTimerecords = this.allTimerecords.slice(0, 5);

      const weeklyTotals = this.groupByWeek(this.allTimerecords);
      this.weeklyDataSource.data = weeklyTotals;
      console.log('Wochensummen:', weeklyTotals);
    });
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

  ngAfterViewInit() {
    this.dataSource.sort = this.detailSort;
    this.weeklyDataSource.sort = this.weeklySort;


    this.weeklyDataSource.sortingDataAccessor = (item, property) => {
      if (property === 'weekRange') {
        // Konvertiert dd.MM.yyyy zu yyyy-MM-dd für korrekte String-Sortierung
        const [day, month, year] = item.weekStart.split('.');
        return `${year}-${month}-${day}`;
      }
      return item[property];
    };
    // Optional: Eigene Sort-Funktionen definieren
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'date':
          return item.date;
        case 'time':
          return item.startTime;
        case 'break':
          return item.breakMinutes;
        case 'duration':
          return item.timeWorked;
        case 'by':
          return item.createdBy;
        case 'at':
          return item.createdAt;
        default:
          return (item as any)[property];
      }
    };
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  edit(timerecord: Timerecords) {
    console.log('Edit:', timerecord);
    const dialog = this.dialog.open(DialogEditRecordComponent);
    dialog.componentInstance.timerecord = new Timerecords(timerecord);
  }

  delete(timerecord: Timerecords) {
    console.log('Delete:', timerecord);
    // const reallyDelete = confirm('Möchtest du diesen Eintrag wirklich löschen?');
    // if (!reallyDelete) {
    //   return;
    // }
    // this.dataStoreService.deleteTimerecord(timerecord);
    const dialog = this.dialog.open(DialogDeleteRecordComponent)
    dialog.componentInstance.timerecord = new Timerecords(timerecord);

    dialog.afterClosed().subscribe(result => {
      // result === true, wenn der Benutzer auf "Löschen" geklickt hat
      if (result === true) {
        console.log('Delete:', timerecord);
        // 3) Jetzt erst wirklich löschen (Service, API-Aufruf etc.)
        this.dataStoreService.deleteTimerecord(timerecord);
      }
    });
  }
}