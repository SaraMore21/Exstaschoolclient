export class DocumentsPerSchool{
  constructor(
    public iddocumentPerSchool?:number,
    public name?:string,
    public path?:string,
    public schoolId?:number,
    public requiredDocumentPerSchoolId?:number,
    public userCreatedId?:number,
    public dateCreated?:Date,
    public userUpdatedId?:number,
    public dateUpdated?:Date,
    public folderId?: number,
    public type?: string,
    public folderCreated?: number,
    public indexFolder?: number,
    public exsistDocumentId ?: number,
    public folderName?:string,
    public displayOrderNum?: number,
    public uniqueCodeId ?: number,
    public isSelected?:boolean
  ) {
  }
}
