import { NumberInput } from "@angular/cdk/coercion";
import { User } from "./user";

export class UserPerCourse {
    constructor(
        public  iduserPerCourse ?:number,
        public  groupSemesterPerCourseId ?:number,
        public  userId ?:number,
        public  fromDate ?:Date,
        public  toDate ?:Date,
        public  userCreatedId ?:number,
        public  userUpdatedId ?:number,
        public  dateUpdated ?:Date,
        public  dateCreated ?:Date,
        public  user ?:User
    ){};
}
