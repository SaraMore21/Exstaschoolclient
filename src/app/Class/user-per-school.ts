import { Address } from './address';
import { Birth } from './birth';
import { ContactInformation } from './contact-information';
import { User } from './user';
export class UserPerSchool {

  constructor(
    public iduserPerSchool?: number,
    public userId?: number,
    public schoolId?: number,
    public userCreated?: number,
    public dateCreated?: Date,
    public userUpdeted?: number,
    public dateUpdated?: Date,
    public contactInformationId?: number,
    public statusId?: number,
    public isActive?: boolean,
    public note?: String,
    public typeUserId?: number,
    public uniqueCodeId ?:number,
    public dateOfStartWork ?:Date,
    public firstName ?:string,
    public lastName ?:string,
    public fullName ?:string,
    public genderId ?:string,
    public birthId ?:string,
    public foreignLastName ?:string,
    public foreignFirstName ?:string,
    public previusName ?:string,
    public yearsOfEducation ?:string,
    public yearsOfSeniority ?:string,
    public degreeId ?:string,
    public addressId ?:string,

    public user?: User,
    public contactInformation?: ContactInformation
  ) {}
}
