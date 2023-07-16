export class Semester {

    constructor(
        public  idsemester?:number,
        public  name ?:string,
        public  fromDate ?:Date,
        public  toDate ?:Date,
        public  yearbookId ?:number,
        public  userCreatedId ?:number,
        public  dateCreated ?:Date,
        public  userUpdatedId ?:number,
        public  dateUpdated ?:Date
    ){}
}
