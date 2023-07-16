export class Presence{
    constructor(
    public idpresence?:number,
    public dailyScheduleId?:number,
    public studentId?:number,
    public typePresenceId?:number,
    public writeby?:number,
    public userCreatedId?:number, 
    public dateCreated?:Date,
    public userUpdatedId?:number,
    public dateUpdated?:Date,
    public typePresenceName?:string){} 
}