import { ContactInformation } from "./contact-information";

export class Contact {
    constructor(
        
        public  idcontact?:number,
        public  contactInformationId?:number,
        public  firstName ?:string,
        public  lastName?:string,
        public  userCreatedId?:number,
        public  dateCreated?:Date,
        public  userUpdatedId?:number,
        public  dateUpdated?:Date,
        public  tz ?:string,
        public  typeIdentityId ?:number,
        public  SchoolId ?:number,
        public  contactInformation?:ContactInformation
    ){}
}
