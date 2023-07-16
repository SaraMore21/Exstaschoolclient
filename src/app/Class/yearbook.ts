export class Yearbook {
    constructor(
        public  idyearbook ?:number,
        public  name ?:string,
        public  fromDate ?:Date,
        public  toDate ?:Date,
        public  userCreatedId ?:number,
        public  dateCreated ?:Date,
        public  userUpdateId ?:number,
        public  dateUpdated ?:Date
    ){}
}
