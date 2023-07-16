import { DocumentsPerTaskExsist } from './../Class/documents-per-task-exsist';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentPerTaskExsistService {


  Url =environment.API_ENDPOINT+ "api/DocumentPerTaskExsist/";
  // Url = "api/DocumentPerTaskExsist/";

  constructor(private http: HttpClient) { }

  getLstDocumentPerTaskExsist(SchoolID: number, idTaskExsist: number): Observable<Array<DocumentsPerTaskExsist>> {
    debugger;
    return this.http.get<Array<DocumentsPerTaskExsist>>(this.Url + "GetLstDocumentPerTaskExsist/" + SchoolID + "/" + idTaskExsist)
  }

  UploadDocumentPerTaskExsist(SchoolID: number, idTaskExsist: number, DocumentsPerTaskExsist: DocumentsPerTaskExsist, numFiles: number = 0): Observable<DocumentsPerTaskExsist> {
    debugger;
    return this.http.post<DocumentsPerTaskExsist>(this.Url + "UploadDocumentPerTaskExsist", DocumentsPerTaskExsist);
  }

  UploadFewDocumentsPerTaskExsist(idschool: number, TaskExsistId: number, ListDocumentsPerTaskExsist: DocumentsPerTaskExsist[],FolderName:string): Observable<Array<DocumentsPerTaskExsist>> {
    debugger;
    return this.http.post<Array<DocumentsPerTaskExsist>>(this.Url + "UploadFewDocumentsPerTaskExsist/"+FolderName, ListDocumentsPerTaskExsist);
  }

  DeleteDocumentPerTaskExsist(iddocumentPerTaskExsist: number, idTaskExsist: number) :Observable<string>{
    debugger;
    return this.http.delete(this.Url + "DeleteDocumentPerTaskExsist/" + iddocumentPerTaskExsist + "/" + idTaskExsist, { responseType: 'text' })
  }

  DeleteFewDocumentPerTaskExsist(FolderId: number ,requiredDocumentPerTaskExsistId:number, TaskExsistId: number):Observable<DocumentsPerTaskExsist> {
    return this.http.delete<DocumentsPerTaskExsist>(this.Url + "DeleteFewDocumentPerTaskExsist/" + FolderId +"/"+ requiredDocumentPerTaskExsistId);
  }

  SaveNameFile(idfile: number, NameFile: string) {
    return this.http.get(this.Url + "SaveNameFile/" + idfile +"/"+ NameFile);
  }
}
