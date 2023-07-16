export class Birth {

    constructor(
        public  idbirth?:number,//
        public  birthCountryId?:number,//
        public  birthDate ?:Date,//
        public  birthHebrewDate?:string,
        public  citizenshipId ?:number,
        public  dateOfImmigration ?:Date,
        public  countryIdofImmigration ?:number,
        public  userCreatedId ?:number,
        public  dateCreated ?:Date,
        public  userUpdatedId ?:number,
        public  dateUpdated ?:Date
    ){}
}
