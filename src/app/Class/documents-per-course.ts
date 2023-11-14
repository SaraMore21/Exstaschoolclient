export class DocumentsPerCourse {

  constructor(
    public iddocumentPerCourse?:number,
    public name?:string,
    public path?:string,
    public courseId?:number,
    public schoolId?:number,
    public requiredDocumentPerCourseId?:number,
    public userCreatedId?:number,
    public dateCreated?:Date,
    public userUpdatedId?:number,
    public dateUpdated?:Date,
    public folderId?:number,
    public folderName?:string,
    public type?: string,
    public folderCreated?: number,
    public indexFolder?: number,
    public displayOrderNum?: number,
    public exsistDocumentId ?: number,
    public isSelected ?:boolean
    
  ) {

  }
}
