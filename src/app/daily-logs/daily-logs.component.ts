import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Timerecords } from '../models/timerecords.class';
import { MatDialog } from '@angular/material/dialog';
import { DialogEditRecordComponent } from '../dialog-edit-record/dialog-edit-record.component';
import { DialogDeleteRecordComponent } from '../dialog-delete-record/dialog-delete-record.component';
import { DataStoreServiceService } from '../services/data-store-service.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';



@Component({
  selector: 'app-daily-logs',
  standalone: true,
  imports: [MatIconModule, MatTableModule, MatSortModule, CommonModule],
  templateUrl: './daily-logs.component.html',
  styleUrl: './daily-logs.component.scss'
})


export class DailyLogsComponent {
  allTimerecords: Timerecords[] = [];
  private _liveAnnouncer = inject(LiveAnnouncer);
  dataStoreService = inject(DataStoreServiceService);
  dataSource = new MatTableDataSource(this.allTimerecords);
  dialog = inject(MatDialog);
  displayedColumns: string[] = ['date', 'day', 'time', 'duration', 'break', 'by', 'at', 'edit'];
  @ViewChild('detailSort') detailSort!: MatSort;

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
    });
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.detailSort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'date': return item.date;
        case 'time': return item.startTime;
        case 'break': return item.breakMinutes;
        case 'duration': return item.timeWorked;
        case 'by': return item.createdByName;
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
    });
  }

  delete(timerecord: Timerecords) {
    const dialog = this.dialog.open(DialogDeleteRecordComponent);
    dialog.componentInstance.timerecord = new Timerecords(timerecord);
    dialog.afterClosed().subscribe(result => {
      if (result === true) {
        this.dataStoreService.deleteTimerecord(timerecord);
      }
    });
  }
}

