import { AttendancePerLesson } from "./AttendancePerLesson";
import {Indexer} from "src/app/Class/indexer"
export class AttendencePerDay extends Indexer

{ 
    /**
     *
     */
   
    constructor(
    public nochecotPerLesson?:Array<AttendancePerLesson>,
    public date?:Date ,
    public hebrewDate?:string,
    public nameStudent?:string ,
    public tz?:string ,
    public idStudent?:number){
        super();
    }

}
