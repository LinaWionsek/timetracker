import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timerecords } from '../models/timerecords.class';
import { DataStoreServiceService } from '../services/data-store-service.service';
import { startOfWeek, format, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

@Component({
  selector: 'app-last-records',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './last-records.component.html',
  styleUrl: './last-records.component.scss'
})
export class LastRecordsComponent {

  dataStoreService = inject(DataStoreServiceService);

  allTimerecords: Timerecords[] = [];
  //allTimerecords braucht kein $, weil es sich dabei um die konkreten Daten (ein normales Array) handelt und nicht um ein Observable.
  

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
     

      this.sortTimeRecords();
      // Zeigt nur die ersten 5 Einträge an (schon sortiert durch sortTimeRecords)
      this.allTimerecords = this.allTimerecords.slice(0, 5);

      const weeklyTotals = this.groupByWeek(this.allTimerecords);
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










}
