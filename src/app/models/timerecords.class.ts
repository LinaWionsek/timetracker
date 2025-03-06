
export class Timerecords {
    public id: string;
    public date: number;
    public day: string;
    public startTime: string;
    public endTime: string;
    public timeWorked: string;
    public timeWithoutBreak: string;
    public breakMinutes: number;
    public totalMinutes: number;
    public createdBy: string;
    public createdAt: number;
    
    constructor(init?: Partial<Timerecords>) {
        this.id = init?.id || '';
        this.date = init?.date || Date.now();
        this.day = init?.day || '';
        this.startTime = init?.startTime || '';
        this.endTime = init?.endTime || '';
        this.timeWorked = init?.timeWorked || '';
        this.timeWithoutBreak = init?.timeWithoutBreak || '';
        this.breakMinutes = init?.breakMinutes || 0;
        this.totalMinutes = init?.totalMinutes || 0;
        this.createdBy = init?.createdBy || 'Dummy User';
        this.createdAt = init?.createdAt || Date.now();
    }

    static fromJSON(obj: any): Timerecords {
        return new Timerecords({
            id: obj.id || '',
            date: typeof obj.date === 'number' ? obj.date : Number(obj.date),
            day: obj.day || '',
            startTime: obj.startTime || '',
            endTime: obj.endTime || '',
            timeWorked: obj.timeWorked || '',
            timeWithoutBreak: obj.timeWithoutBreak || '',
            breakMinutes: obj.breakMinutes || 0,
            totalMinutes: obj.totalMinutes || 0,
            createdBy: obj.createdBy || 'Dummy User',
            createdAt: typeof obj.createdAt === 'number' ? obj.createdAt : Date.now()
        });
    }

    /** 
     * Konvertiert die Instanz in ein Plain Object für Firebase
     */
    toJSON() {
        return {
            id: this.id,
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