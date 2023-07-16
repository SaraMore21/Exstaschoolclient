export class Address {
    constructor(

        public  idaddress ?:number,
        public  cityId ?:number,
        public  streetId ?:number,
        public  houseNumber ?:string,
        public  apartmentNumber ?:string,
        public  poBox ?:number,
        public  zipCode ?:number,
        public  neighborhoodId ?:number,
        public  userCreatedId ?:number,
        public  dateCreated ? :Date,
        public  userUpdatedId ?:number,
        public  dateUpdated ?:Date,
        public  comment ?:string
    ){}
}
