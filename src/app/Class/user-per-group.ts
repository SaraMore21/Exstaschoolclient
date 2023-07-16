import { UserPerSchool } from "./user-per-school";

export class UserPerGroup {
    constructor(
        public  iduserPerGroup ?:number,
        public  userId ?:number,
        public  groupId ?:number,
        public  fromDate ?:Date,
        public  toDate ?:Date,
        public  userCreatedId ?:number,
        public  dateCreated ?:Date,
        public  userUpdatedId ?:number,
        public  dateUpdated ?:Date,
        public  user ?:UserPerSchool
    ){}
}
