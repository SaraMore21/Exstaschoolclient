import { Contact } from './contact';
import { TypeContact } from './type-contact'

export class ContactPerStudent {
    constructor(
        public  idcontactPerStudent?:number,
        public  studentId?:number,
        public  contactId ?:number,
        public  typeContactId?:number,
        public  userCreatedId?:number,
        public  dateCreated?:Date,
        public  userUpdatedId ?:number,
        public  dateUpdated?:Date,

        public  contact?:Contact,
        public  typeContact?:TypeContact
    ){}
    
}
