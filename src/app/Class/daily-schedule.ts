import { Time } from "@angular/common";

export class DailySchedule {
    constructor(
        public iddailySchedule?: number,
        public teacherId?: number,
        public teacherName?: string,
        public scheduleRegularId?: number,
        public courseId?: number,
        public courseName?: string,
        public schoolId?: number,
        public lessonPerGroupId?: number,
        public dayInWeek?: number,
        public numLesson?: number,
        public isChange?: boolean,
        public scheduleDate?: Date,
        public startTime ?:string,
        public endTime ?:string,
        public learningStyleId?: number,
        public learningStyleName?: string,
        public userCreatedId?: number,
        public dateCreated?: Date,
        public userUpdatedId?: number,
        public dateUpdated?: Date
    ) { }
}
