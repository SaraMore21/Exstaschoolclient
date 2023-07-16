export class StudentAttendance {

    constructor(
        public  idstudentAttendance ?:number,
        public  studentId ?:number,
        public  attendanceId ?:number,
        public  dailyScheduleId ?:number,
        public  userCreatedId ?:number,
        public  dateCreated ?:Date,
        public  userUpdatedId ?:number,
        public  dateUpdated ?:Date
    ){}
}
