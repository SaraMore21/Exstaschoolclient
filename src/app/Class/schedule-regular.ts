import { Time } from "@angular/common";

export class ScheduleRegular {

    constructor(
        public idscheduleRegular?: number,
        public courseId?: number,
        public courseName?: string,
        public schoolId?: number,
        public teacherId?: number,
        public teacherName?: string,
        public dayOfWeek?: number,
        public numLesson?: number,
        public startDate?: Date,
        public endDate?: Date,
        public startTime?:string,
        public endTime?:string,
        // public typeLearningId?: number,
        // public typeLearningName?: string,
        public userCreatedId?: number,
        public dateCreated?: Date,
        public userUpdatedId?: number,
        public dateUpdated?: Date,
        public lessonPerGroupId?:number
    ) { }
}
