export class DocumentsPerFatherCourse {

  constructor(
    public iddocumentPerFatherCourse?:number,
    public name?:string,
    public path?:string,
    public fatherCourseId?:number,
    public schoolId?:number,
    public requiredDocumentPerFatherCourseId?:number,
    public userCreatedId?:number,
    public dateCreated?:Date,
    public userUpdatedId?:number,
    public dateUpdated?:Date,
    public folderId?:number,
    public folderName?:string,
    public type?: string,
    public folderCreated?: number,
    public uniqueCodeId ?: number,
    public indexFolder?: number,
    public displayOrderNum?: number,
    public exsistDocumentId ?: number

  ) {

  }
}
