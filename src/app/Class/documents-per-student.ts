export class DocumentsPerStudent {
  /**
   *
   */
  constructor(
     public iddocumentPerStudent?:number,
     public name?:string,
     public path?:string,
     public studentId?:number,
     public schoolId?:number,
     public requiredDocumentPerStudentId?:number,
     public userCreatedId?:number,
     public dateCreated?:Date,
     public userUpdatedId?:number,
     public dateUpdated?:Date,
     public folderId?: number,
     public folderName?: string,
     public type?: string,
     public folderCreated?: number,
     public indexFolder?: number,
     public displayOrderNum?: number,
     public exsistDocumentId?: number
     ) {
  }
}




