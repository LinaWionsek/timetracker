import { timeRecords } from './../../app/types/types';

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
    
}


// toPlainObject(){
//     return {
//         day: this.day,
//     }
// }
