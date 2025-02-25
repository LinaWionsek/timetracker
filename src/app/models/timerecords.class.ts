import { timeRecords } from './../../app/types/types';
import { startOfWeek, format } from 'date-fns';
import { de } from 'date-fns/locale';

export class Timerecords {

    constructor(
        public date: number = Date.now(),
        public day: string = '',
        public startTime: string = '',
        public endTime: string = '',
        public timeWorked: string = '',
        public timeWithoutBreak: string = '',
        public breakMinutes: number = 0,
        public totalMinutes: number = 0,
        public createdBy: string = 'Dummy User',
        public createdAt: number = Date.now()
    ) { }

    static fromJSON(obj: any): Timerecords {
        return new Timerecords(
            typeof obj.date === 'number' ? obj.date : Number(obj.date),
            obj.day || '',
            obj.startTime || '',
            obj.endTime || '',
            obj.timeWorked || '',
            obj.timeWithoutBreak || '',
            obj.breakMinutes || 0,
            obj.totalMinutes || 0,
            obj.createdBy || 'Dummy User',
            typeof obj.createdAt === 'number' ? obj.createdAt : Date.now()
        );
    }

    /** 
     * Konvertiert die Instanz in ein Plain Object für Firebase
     */
    toJSON() {
        return {
            date: this.date,
            day: this.day,
            startTime: this.startTime,
            endTime: this.endTime,
            timeWorked: this.timeWorked,
            timeWithoutBreak: this.timeWithoutBreak,
            breakMinutes: this.breakMinutes,
            totalMinutes: this.totalMinutes,
            createdBy: this.createdBy,
            createdAt: this.createdAt
        };
    }

}