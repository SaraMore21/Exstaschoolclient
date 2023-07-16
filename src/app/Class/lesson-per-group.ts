import { Time } from "@angular/common";

export class LessonPerGroup {
    constructor(
    public  idlessonPerGroup?:number,
    public  groupId ?:number,
    public  dayOfWeek ?:number,
    public  numLesson ?:string,
    public  startTime ?:string,
    public  endTime ?:string,
    public  userCreatedId ?:number,
    public  dateCreated ?:Date,
    public  userUpdatedId ?:number,
    public  dateUpdated ?:Date
    ){}
}
