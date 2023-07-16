export class AttendanceMarking {
    constructor(
        public  idattendanceMarkings ?:number,
        public  markingName ?:string,
        public  markingTypeId ?:number,
        public  markupDisplay ?:string,
        public  schoolId ?:number,
        public  userCreatedId ?:number,
        public  dateCreated ?:Date,
        public  userUpdatedId ?:number,
        public  dateUpdated ?:Date,
    ){}
}
