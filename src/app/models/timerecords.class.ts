import { timeRecords } from './../../app/types/types';
import { startOfWeek, format } from 'date-fns';
import { de } from 'date-fns/locale';

export class Timerecords {
    date: Date | string;
    day: string;
    startTime: string;
    endTime: string;
    timeWorked?: string;
    timeWithoutBreak?: string;
    breakMinutes: number;
    totalMinutes?: number

    constructor(data: timeRecords) {
        this.date = data.date ? new Date(data.date) : '';
        this.day = data?.day ?? '';
        this.startTime = data?.startTime ?? '';
        this.endTime = data?.endTime ?? '';
        this.timeWorked = data?.timeWorked ?? '';
        this.timeWithoutBreak = data?.timeWithoutBreak ?? '';
        this.breakMinutes = data?.breakMinutes ?? 0;
        this.totalMinutes = data?.totalMinutes ?? 0;
    }
    
    // static groupByWeek(records: Timerecords[]) {
    //     const weeks: { [key: string]: number } = {};
        
    //     records.forEach(record => {
    //         const weekStart = startOfWeek(new Date(record.date), { weekStartsOn: 1 });
    //         const weekKey = format(weekStart, 'yyyy-MM-dd');
            
    //         weeks[weekKey] = (weeks[weekKey] || 0) + (record.totalMinutes || 0);
    //     });

    //     return Object.entries(weeks).map(([date, minutes]) => ({
    //         weekStart: date,
    //         totalHours: `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, '0')}`
    //     }));
    // }
}


// toPlainObject(){
//     return {
//         day: this.day,
//     }
// }
