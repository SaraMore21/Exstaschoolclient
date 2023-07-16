export class DocumentsPerUser {
  constructor(
    public iddocumentPerUser?: number,
    public name?: string,
    public path?: string,
    public UserId?: number,
    public schoolId?: number,
    public requiredDocumentPerUserId?: number,
    public userCreatedId?: number,
    public dateCreated?: Date,
    public userUpdatedId?: number,
    public dateUpdated?: Date,
    public folderId?: number,
    public folderName?: string,
    public type?: string,
    public folderCreated?: number,
    public uniqueCodeId?: number,
    public indexFolder?: number,
    public displayOrderNum?: number,
    public exsistDocumentId?: number

  ) { }
}
