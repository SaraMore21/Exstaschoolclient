export class DocumentsPerProfession {

  constructor(
    public iddocumentPerProfession?:number,
    public name?:string,
    public path?:string,
    public ProfessionId?:number,
    public schoolId?:number,
    public requiredDocumentPerProfessionId?:number,
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
