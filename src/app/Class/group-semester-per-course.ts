import { Course } from "./course";
import { Indexer } from "./indexer";

export class GroupSemesterPerCourse extends Indexer{
    constructor(
        public  idgroupSemesterPerCourse ?:number,
        public  semesterId ?:number,
        public  courseId ?:number,
        public  groupId ?:number,
        public  code ?:string,
        public  fromDate ?:Date,
        public  toDate ?:Date,
        public  userCreatedId ?:number,
        public  dateCreated ?:Date,
        public  userUpdatedId ?:number,
        public  dateUpdate ?:Date,
        
        public  groupName ?:string,
        public  semesterName ?:string,
        public course ?:Course
    ){
        super()
    }
}
