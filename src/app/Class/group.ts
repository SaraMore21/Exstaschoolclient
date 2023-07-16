import { Indexer } from "./indexer";

export class Group extends Indexer{

    
    constructor(
        public  idgroup ?:number,
        public  ageGroupId ?:number,
        public  schoolId ?:number,
        public  typeGroupId ?:number,
        public  extensionId ?:number,
        public  voiceSpaceId ?:number,
        public  listeningTimeId ?:number,
        public  userCreatedId ?:number,
        public  dateCreated ?:Date,
        public  userUpdetedId ?:number,
        public  dateUpdated ?:Date,
        public  nameGroup ?:string,
        public coordinationCode?:string

    ){
        super()
    }
}
