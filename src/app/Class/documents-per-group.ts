export class DocumentsPerGroup {
  /**
   *
   */
  constructor(
    public iddocumentPerGroup?:number,
    public name?:string,
    public path?:string,
    public GroupId?:number,
    public schoolId?:number,
    public requiredDocumentPerGroupId?:number,
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
    public exsistDocumentId ?: number
  ) {

  }
}
