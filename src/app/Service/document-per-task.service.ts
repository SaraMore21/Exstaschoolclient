import { DocumentsPerTask } from './../Class/documents-per-task';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DocumentPerTaskService {

  Url =environment.API_ENDPOINT+ "api/DocumentPerTask/";
  // Url = "api/DocumentPerTask/";

  constructor(private http: HttpClient) { }

  getLstDocumentPerTask(SchoolID: number, idTask: number): Observable<Array<DocumentsPerTask>> {
    debugger;
    return this.http.get<Array<DocumentsPerTask>>(this.Url + "GetLstDocumentPerTask/" + SchoolID + "/" + idTask)
  }

  UploadDocumentPerTask(SchoolID: number, idTask: number, DocumentsPerTask: DocumentsPerTask, numFiles: number = 0, uniqueCodeID: number = 0): Observable<DocumentsPerTask> {
    debugger;
    return this.http.post<DocumentsPerTask>(this.Url + "UploadDocumentPerTask/" + uniqueCodeID, DocumentsPerTask);
  }

  UploadFewDocumentsPerTask(idschool: number, TaskId: number, ListDocumentsPerTask: DocumentsPerTask[], FolderName: string, uniqueCodeID: number, UserId: number, CustomerId: number): Observable<Array<DocumentsPerTask>> {
    debugger;
    return this.http.post<Array<DocumentsPerTask>>(this.Url + "UploadFewDocumentsPerTask/" + FolderName + "/" + uniqueCodeID + "/" + UserId + "/" + CustomerId, ListDocumentsPerTask);
  }

  DeleteDocumentPerTask(iddocumentPerTask: number, idTask: number, uniqueCodeId: number): Observable<string> {
    debugger;
    return this.http.delete(this.Url + "DeleteDocumentPerTask/" + iddocumentPerTask + "/" + idTask + "/" + uniqueCodeId, { responseType: 'text' })
  }

  DeleteFewDocumentPerTask(FolderId: number, requiredDocumentPerTaskId: number, TaskId: number, uniqueCodeDocumentId): Observable<DocumentsPerTask> {
    return this.http.delete<DocumentsPerTask>(this.Url + "DeleteFewDocumentPerTask/" + FolderId + "/" + requiredDocumentPerTaskId + "/" + TaskId + "/" + uniqueCodeDocumentId);
  }

  SaveNameFile(idfile: number, NameFile: string, uniqeId: number) {
    return this.http.get(this.Url + "SaveNameFile/" + idfile + "/" + NameFile + "/" + uniqeId);
  }
}
