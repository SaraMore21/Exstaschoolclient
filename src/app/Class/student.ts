import { Scroll } from "@angular/router";
import{} from '../Class/contact-per-student'
import {Indexer} from "./indexer"
import { ContactPerStudent } from "./contact-per-student";
export class Student extends Indexer {
    constructor(
        public  idstudent ?:number,
        public  tz ?:string,
        public  typeIdentityId ?:number,
        public  firstName ?:string,
        public  lastName ?:string,
        public  birthId ?:number,
        public  code ?:string,
        public  gender ?:number,
        public  passportPicture?:string,
        public  foreignLastName?:string,
        public  foreignFirstName?:string,
        public  previusName?:string,
        public  fatherTz ?:string,
        public  motherTz ?:string,
        public  fatherTypeIdentity ?:number,
        public  motherTypeIdentity ?:number,
        public  note ?:string,
        public  enatherDetails ?:string,
        public  statusId ?:number,
        public  statusStudentId ?:number,
        public  reasonForLeaving ?:number,
        public  contactInformationId ?:number,
        public  adressId ?:number,
        public  schoolId ?:number,
        public  isActive ?:boolean,
        public  field1 ?:string,
        public  field2 ?:string,
        public  field3 ?:string,
        public  field4 ?:string,
        public  field5 ?:string,
        public  userCreatedId ?:number,
        public  dateCreated ?:Date,
        public  userUpdatedId ?:number,
        public  dateUpdated ?:Date,
        // public  yearbookId ?:number,
        public schoolName?:string,
        public numRequiredPerStudent? :number,
        public numExsistRequiredPerStudent?: number,
        public contactPerStudent ?:ContactPerStudent,
        public checked ?:boolean


    ){
        super()
    }





}
