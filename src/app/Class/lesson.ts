export class Lesson
    {
        constructor(
        public id?:number, 
        public scheduleId?:number, 
        public date?:Date ,
        public hebrewDate?:string ,
        public isChanges?:boolean, 
        public teacherId?:number, 
        public lessonNumber?:number ,
        public lessonName?:string
    ){}
}