export class DocumentsPerTask {

  constructor(
    public iddocumentPerTask?:number,
    public name?:string,
    public path?:string,
    public TaskId?:number,
    public schoolId?:number,
    public requiredDocumentPerTaskId?:number,
    public userCreatedId?:number,
    public dateCreated?:Date,
    public userUpdatedId?:number,
    public dateUpdated?:Date,
    public folderId?:number,
    public folderName?:string,
    public type?: string ,
    public folderCreated?: number,
    public uniqueCodeId ?: number,
    public indexFolder?: number,
    public displayOrderNum?: number,
    public exsistDocumentId ?: number

  ) {

  }
}
