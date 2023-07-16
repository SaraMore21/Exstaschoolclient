export class Course {
    constructor(
        public  idcourse ?:number,
        public  name ?:string,
        public  professionId ?:number,
        public  teacherId ?:number,
        public  yearId ?:number,
        public  hoursPerWeek ?:number,
        public  hours ?:number,
        public  credits ?:number,
        public  code ?:string,
        public  cost ?:number,
        public  minimumScore ?:number,
        public  learningStyleId ?:number,
        public  schoolId ?:number,
        public  userCreatedId ?:number,
        public  dateCreate ?:Date,
        public  userUpdatedId ?:number,
        public  dateUpdate ?:Date,

        public  groupName ?:string,
        public  schoolName?:string

    ){}
}
