import { Address} from 'src/app/Class/address';
import {Birth} from 'src/app/Class/birth'
import { Indexer } from './indexer';

export class User extends Indexer{
    constructor(
        public  iduser?:number,
        public tz ?:string,
        public typeIdentityId?:number,
        public userPassword?:string,
        public userCode?:string,
        public firstName?:string,
        public lastName?:string,
        public fullName?:string,
        public genderId?:number,
        public addressId?:number,
        public userCreated ?:number,
        public dateCreated ?:Date,
        public userUpdated?:number,
        public dateUpdated ?:Date,
        // public yearbookId?:number,

        public  schoolId ?:number,
        public  schoolName ?:string,
        public  uniqueCodeId ?: number,

        public userPerSchoolID?: number,
        public address ?:Address,
        public birth?:Birth
    ) { 
        super()
    }
}
