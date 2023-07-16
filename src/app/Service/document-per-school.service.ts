import { DocumentsPerSchool } from './../Class/documents-per-school';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentPerSchoolService {

  Url =environment.API_ENDPOINT+ "api/DocumentPerSchool/";
  // Url = "api/DocumentPerSchool/";

  constructor(private http: HttpClient) { }

  getLstDocumentPerSchool(SchoolID: number): Observable<Array<DocumentsPerSchool>> {
    debugger;
    return this.http.get<Array<DocumentsPerSchool>>(this.Url + "GetLstDocumentPerSchool/" + SchoolID )
  }

  UploadDocumentPerSchool(SchoolID: number, DocumentsPerSchool: DocumentsPerSchool, numFiles: number = 0, uniqueCodeID: number = 0): Observable<DocumentsPerSchool> {
    debugger;
    return this.http.post<DocumentsPerSchool>(this.Url + "UploadDocumentPerSchool/"+uniqueCodeID, DocumentsPerSchool);
  }

  UploadFewDocumentsPerSchool(idschool: number, ListDocumentsPerSchool: DocumentsPerSchool[],FolderName:string,uniqueCodeID: number , UserId: number , CustomerId:number): Observable<Array<DocumentsPerSchool>> {
    debugger;
    if(uniqueCodeID==null || uniqueCodeID== undefined) uniqueCodeID=0;
    return this.http.post<Array<DocumentsPerSchool>>(this.Url + "UploadFewDocumentsPerSchool/"+FolderName+"/"+ uniqueCodeID+"/"+UserId+"/"+CustomerId, ListDocumentsPerSchool);
  }

  DeleteDocumentPerSchool(iddocumentPerSchool: number, idSchool: number, uniqueCodeId:number) :Observable<string>{
    debugger;
    return this.http.delete(this.Url + "DeleteDocumentPerSchool/" + iddocumentPerSchool + "/" + idSchool+ "/"+uniqueCodeId, { responseType: 'text' })
  }

  DeleteFewDocumentPerSchool(FolderId: number ,requiredDocumentPerSchoolId:number, SchoolId: number, uniqueCodeDocumentId):Observable<DocumentsPerSchool> {
    return this.http.delete<DocumentsPerSchool>(this.Url + "DeleteFewDocumentPerSchool/" + FolderId +"/"+ requiredDocumentPerSchoolId+"/"+SchoolId+"/"+uniqueCodeDocumentId);
  }

  SaveNameFile(idfile: number, NameFile: string, uniqeId:number) {
    return this.http.get(this.Url + "SaveNameFile/" + idfile +"/"+ NameFile+ "/"+uniqeId);
  }
}

