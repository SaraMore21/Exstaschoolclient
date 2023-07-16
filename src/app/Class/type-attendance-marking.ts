import { Data } from "@angular/router";

export class TypeAttendanceMarking {

    constructor(
        public  idtypeAttendanceMarking ?:number,
        public  typeAttendanceName ?:string,
        public  attendancePercentage ?:number,
        public  schoolId ?:number,
        public  userCreatedId ?:number,
        public  dateCreated ?:Data,
        public  userUpdatedId ?:number,
        public  dateUpdated ?:Date,
    ){}
}
