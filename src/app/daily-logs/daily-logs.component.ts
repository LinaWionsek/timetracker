import { Component, inject, Input, SimpleChanges, ViewChild } from '@angular/core';
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
import { User } from '../models/user.class';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { ToastComponent } from "../toast/toast.component";
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-daily-logs',
  standalone: true,
  imports: [MatIconModule, MatTableModule, MatSortModule, CommonModule, MatPaginatorModule, ToastComponent],
  templateUrl: './daily-logs.component.html',
  styleUrl: './daily-logs.component.scss'
})


export class DailyLogsComponent {
  allTimerecords: Timerecords[] = [];
  private _liveAnnouncer = inject(LiveAnnouncer);
  dataStoreService = inject(DataStoreServiceService);
  toastService = inject(ToastService);
  dataSource = new MatTableDataSource(this.allTimerecords);
  dialog = inject(MatDialog);
  displayedColumns: string[] = ['date', 'day', 'time', 'duration', 'break', 'by', 'at', 'edit'];
  @ViewChild('detailSort') detailSort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() user!: User;
  @Input() records: Timerecords[] = [];
  
  ngOnInit() {
    this.updateDataSource();
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['user'] || changes['records']) {
      this.updateDataSource();
    }
  }

  updateDataSource() {
    const recordsForUser = this.records.filter(record => record.createdById === this.user.id);
    this.dataSource.data = recordsForUser;
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.detailSort;
    // Assign the MatPaginator to the dataSource so that pagination works correctly.
    // Without this, the table will display all entries at once instead of paginating them.
    this.dataSource.paginator = this.paginator;
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
        this.toastService.showToast('Eintrag erfolgreich gelöscht!');
      }
    });
  }
}

