
import { Indexer } from "./indexer";
export class TaskExsist extends Indexer {


  constructor(
    public idexsistTask?: number,
    public taskId?: number,
    public dateSubmitA?: Date,
    public dateSubmitB?: Date,
    public dateSubmitC?: Date,
    public percents?: number,
    public passingGrade?: number,
    public cost?: number,
    public userCreatedId?: number,
    public dateCreated?: Date,
    public userUpdatedId?: number,
    public dateUpdated?: Date,
    public schoolId?: number,
    public coordinatorId?: number,
    public yearBookId?: number,
    public name?: string,
    public codeTaskExsist?: string,
    public courseId?: number,
    public courseName?: string,
    public coordinatorName?: string,
    public percentsCourse ?:number,
    public groupName ?:string
    

  ) {super()

  }
}
