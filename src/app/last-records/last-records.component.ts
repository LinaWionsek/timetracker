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

      this.allTimerecords = changes.map(record => ({
        ...record,
        date: new Date(record.date)
      }));

      this.sortTimeRecords();

      const weeklyTotals = this.groupByWeek(this.allTimerecords);
      console.log('Wochensummen:', weeklyTotals);
    });
  }

  groupByWeek(records: Timerecords[]) {
    // Erstellt ein leeres Objekt, das als Schlüssel das Datum (als String) 
    // und als Wert die Gesamtminuten (als Number) speichert
    const weeks: { [key: string]: number } = {};

    records.forEach(record => {
      // Findet den Montag der Woche für das aktuelle Datum
      const weekStart = startOfWeek(new Date(record.date), { weekStartsOn: 1 });
      // Formatiert dieses Datum als String (z.B. "2024-02-12")
      const weekKey = format(weekStart, 'yyyy-MM-dd');

      // Berechnung der Minuten
      let minutes = record.totalMinutes;
      // Falls keine totalMinutes vorhanden sind, aber timeWorked (z.B. "8:30")
      if (!minutes && record.timeWorked) {
        // Spaltet "8:30" in [8, 30] auf und wandelt in Zahlen um
        const [hours, mins] = record.timeWorked.split(':').map(Number);
        // Rechnet Stunden in Minuten um und addiert die Minuten
        minutes = hours * 60 + mins;
      }
      // Addiert die Minuten zur entsprechenden Woche
      // || 0 bedeutet: falls weeks[weekKey] noch nicht existiert, starte bei 0
      weeks[weekKey] = (weeks[weekKey] || 0) + (minutes || 0);
    });
    // Wandelt das weeks-Objekt in ein Array von Wochen-Zusammenfassungen um
    return Object.entries(weeks).map(([date, minutes]) => ({
      // Formatiert das Start-Datum schön (z.B. "12.02.2024")
      weekStart: format(new Date(date), 'dd.MM.yyyy'),
      // Berechnet und formatiert das End-Datum (Sonntag) der Woche
      weekEnd: format(endOfWeek(new Date(date), { weekStartsOn: 1 }), 'dd.MM.yyyy'),
      // Wandelt die Gesamtminuten in ein "Stunden:Minuten" Format um
      // Math.floor(minutes / 60) gibt die vollen Stunden
      // minutes % 60 gibt die übrigen Minuten
      // padStart(2, '0') fügt führende Nullen hinzu, falls nötig
      totalHours: `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, '0')}`
    }));
  }

  sortTimeRecords() {
    this.allTimerecords.sort((a, b) => {
      // ensures that each record's date is a Date object
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }









}
