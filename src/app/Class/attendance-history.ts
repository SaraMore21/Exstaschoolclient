export class AttendanceHistory {

    constructor(
        public idattendanceHistory?: number,
        public studentAttendanceId?: number,
        public attendanceId?: number,
        public userCreatedId?: number,
        public dateCreated?: Date,
        public userUpdatedId?: number,
        public dateUpdated?: Date
    ) { }
}
