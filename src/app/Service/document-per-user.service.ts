import { DocumentsPerUser } from './../Class/documents-per-user';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentPerUserService {

  Url =environment.API_ENDPOINT+ "api/DocumentPerUser/";
  // Url = "api/DocumentPerUser/";

  constructor(private http: HttpClient) { }

  getLstDocumentPerUser(SchoolID: number, idUser: number): Observable<Array<DocumentsPerUser>> {
    debugger;
    return this.http.get<Array<DocumentsPerUser>>(this.Url + "GetLstDocumentPerUser/" + SchoolID + "/" + idUser)
  }

  UploadDocumentPerUser(SchoolID: number, idUser: number, DocumentsPerUser: DocumentsPerUser, numFiles: number = 0, uniqueCodeID: number = 0): Observable<DocumentsPerUser> {
    debugger;
    return this.http.post<DocumentsPerUser>(this.Url + "UploadDocumentPerUser/"+uniqueCodeID, DocumentsPerUser);
  }

  UploadFewDocumentsPerUser(idschool: number, UserId: number, ListDocumentsPerUser: DocumentsPerUser[],FolderName:string,uniqueCodeID: number , CurrentUserId: number , CustomerId:number): Observable<Array<DocumentsPerUser>> {
    debugger;
    return this.http.post<Array<DocumentsPerUser>>(this.Url + "UploadFewDocumentsPerUser/"+FolderName+"/"+ uniqueCodeID+"/"+CurrentUserId+"/"+CustomerId, ListDocumentsPerUser);
  }

  DeleteDocumentPerUser(iddocumentPerUser: number, idUser: number, uniqueCodeId:number) :Observable<string>{
    debugger;
    return this.http.delete(this.Url + "DeleteDocumentPerUser/" + iddocumentPerUser + "/" + idUser+ "/"+uniqueCodeId, { responseType: 'text' })
  }

  DeleteFewDocumentPerUser(FolderId: number ,requiredDocumentPerUserId:number, UserId: number, uniqueCodeDocumentId):Observable<DocumentsPerUser> {
    return this.http.delete<DocumentsPerUser>(this.Url + "DeleteFewDocumentPerUser/" + FolderId +"/"+ requiredDocumentPerUserId+"/"+UserId+"/"+uniqueCodeDocumentId);
  }

  SaveNameFile(idfile: number, NameFile: string, uniqeId:number) {
    return this.http.get(this.Url + "SaveNameFile/" + idfile +"/"+ NameFile+ "/"+uniqeId);
  }
}

