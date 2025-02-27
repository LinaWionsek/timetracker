import { Component } from '@angular/core';
import {MatCardModule} from '@angular/material/card';


@Component({
  selector: 'app-time-logs',
  standalone: true,
  imports: [MatCardModule],
  templateUrl: './time-logs.component.html',
  styleUrl: './time-logs.component.scss'
})
export class TimeLogsComponent {
  displayedColumns: string[] = ['date', 'timestamp', 'break', 'duration', 'edit'];
 
  transactions: any[] = [
    {item: 'Beach ball', cost: 4},
    {item: 'Towel', cost: 5},
    {item: 'Frisbee', cost: 2},
    {item: 'Sunscreen', cost: 4},
    {item: 'Cooler', cost: 25},
    {item: 'Swim suit', cost: 15},
  ];
  
  /** Gets the total cost of all transactions. */
  getTotalCost() {
    // return this.transactions.map(t => t.cost).reduce((acc, value) => acc + value, 0);
  }
}
