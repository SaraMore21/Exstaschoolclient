export class StudentPerCourse {
    constructor(

        public idstudentsPerCourse?: number,
        public studentId?: number,
        public groupSemesterperCourseId?: number,
        public fromDate?: Date,
        public toDate?: Date,
        public grade?: number,
        public finalScore?: number,
        public userCreatedId?: number,
        public dateCreated?: Date,
        public userUpdatedId?: number,
        public dateUpdated?: Date,
        public studentName?: string,
        public studentTz?: string,
        public checked ?:boolean
        
    ) { }
}
