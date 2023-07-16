import { extend } from "jquery"
import {Indexer} from "./indexer"
export class FatherCourse extends Indexer{
    constructor(
        public idcourse ?:number,
        public name ?:string,
        public professionId ?:number,
        public hoursPerWeek ?:number,
        public hours ?:number,
        public credits ?:number,
        public cost ?:number,
        public minimumScore ?:number,
        public learningStyleId ?:number,
        public schoolId ?:number,
        public userCreatedId ?:number,
        public dateCreate ?:Date,
        public userUpdatedId ?:number,
        public dateUpdate ?:Date,
        public yearbookId?:number,
        public professionName ?:string,
        public schoolName ?:string,
        public learningStyleName?:string,
        public uniqueCodeId ?:number,
        public code ?:string,
        public coordinationTypeId?:number
    ){
        super()
    }
}
