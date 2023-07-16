import { DocumentsPerProfession } from './../Class/documents-per-profession';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class DocumentPerProfessionService {

  Url =environment.API_ENDPOINT+ "api/DocumentPerProfession/";
  // Url = "api/DocumentPerProfession/";

  constructor(private http: HttpClient) { }

  getLstDocumentPerProfession(SchoolID: number, idProfession: number): Observable<Array<DocumentsPerProfession>> {
    debugger;
    return this.http.get<Array<DocumentsPerProfession>>(this.Url + "GetLstDocumentPerProfession/" + SchoolID + "/" + idProfession)
  }

  UploadDocumentPerProfession(SchoolID: number, idProfession: number, DocumentsPerProfession: DocumentsPerProfession, numFiles: number = 0, uniqueCodeID: number = 0): Observable<DocumentsPerProfession> {
    debugger;
    return this.http.post<DocumentsPerProfession>(this.Url + "UploadDocumentPerProfession/" + uniqueCodeID, DocumentsPerProfession);
  }

  UploadFewDocumentsPerProfession(idschool: number, ProfessionId: number, ListDocumentsPerProfession: DocumentsPerProfession[], FolderName: string, uniqueCodeID: number, UserId: number, CustomerId: number): Observable<Array<DocumentsPerProfession>> {
    debugger;
    return this.http.post<Array<DocumentsPerProfession>>(this.Url + "UploadFewDocumentsPerProfession/" + FolderName + "/" + uniqueCodeID + "/" + UserId + "/" + CustomerId, ListDocumentsPerProfession);
  }

  DeleteDocumentPerProfession(iddocumentPerProfession: number, idProfession: number, uniqueCodeId: number): Observable<string> {
    debugger;
    return this.http.delete(this.Url + "DeleteDocumentPerProfession/" + iddocumentPerProfession + "/" + idProfession + "/" + uniqueCodeId, { responseType: 'text' })
  }

  DeleteFewDocumentPerProfession(FolderId: number, requiredDocumentPerProfessionId: number, ProfessionId: number, uniqueCodeDocumentId): Observable<DocumentsPerProfession> {
    return this.http.delete<DocumentsPerProfession>(this.Url + "DeleteFewDocumentPerProfession/" + FolderId + "/" + requiredDocumentPerProfessionId + "/" + ProfessionId + "/" + uniqueCodeDocumentId);
  }

  SaveNameFile(idfile: number, NameFile: string, uniqeId: number) {
    return this.http.get(this.Url + "SaveNameFile/" + idfile + "/" + NameFile + "/" + uniqeId);
  }
}
