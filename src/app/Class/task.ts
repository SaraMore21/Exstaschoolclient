import { QuestionsOfTasks } from "./questions-of-tasks";
import { Indexer } from "./indexer";


export class Task extends Indexer{

    constructor(
        public  idtask ?:number,
        public  name ?:string,
        public  nameEnglish ?:string,
        public  typeTaskId ?:number,
        public  schoolId ?:number,
        public  userCreatedId ?:number,
        public  dateCreated ?:Date,
        public  userUpdatedId ?:number,
        public  dateUpdate ?:Date,
        public  codeTask ?:string,
        public  typeTaskName ?:string,
        public  yearBookId ?:number,
        public  coordinatorId ?:number,
        public  coordinatorName ?:string,
        public  schoolName ?:string,
        public  uniqueCodeId ?:number,
        public  typeOfTaskCalculationId ?:number,
        public  typeOfTaskCalculationName ?:number,
        public  checkTypeId ?:number,
        public  checkTypeName ?:string,

        public  ListQuestion ?:Array<QuestionsOfTasks>,

    ){
        super()
    }

}
