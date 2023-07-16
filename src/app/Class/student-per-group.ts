import{Student} from 'src/app/Class/student'

export class StudentPerGroup {
    constructor(
        public  idstudentPerGroup ?:number,
        public  studentId ?:number,
        public  groupId ?:number,
        public  fromDate ?:Date,
        public  toDate ?:Date,
        public  userCreatedId ?:number,
        public  dateCreated ?:Date,
        public  userUpdatedId ?:number,
        public  dateUpdated ?:Date,

        public  student ?:Student
    ){}
}
