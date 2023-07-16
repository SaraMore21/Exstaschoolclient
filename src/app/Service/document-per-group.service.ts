import { DocumentsPerGroup } from './../Class/documents-per-group';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentPerGroupService {

    Url =environment.API_ENDPOINT+ "api/DocumentPerGroup/";
    // Url = "api/DocumentPerGroup/";

    constructor(private http: HttpClient) { }

    getLstDocumentPerGroup(SchoolID: number, idGroup: number): Observable<Array<DocumentsPerGroup>> {
      debugger;
      return this.http.get<Array<DocumentsPerGroup>>(this.Url + "GetLstDocumentPerGroup/" + SchoolID + "/" + idGroup)
    }

    UploadDocumentPerGroup(SchoolID: number, idGroup: number, DocumentsPerGroup: DocumentsPerGroup, numFiles: number = 0): Observable<DocumentsPerGroup> {
      debugger;
      return this.http.post<DocumentsPerGroup>(this.Url + "UploadDocumentPerGroup", DocumentsPerGroup);
    }

    UploadFewDocumentsPerGroup(idschool: number, GroupId: number, ListDocumentsPerGroup: DocumentsPerGroup[],FolderName:string): Observable<Array<DocumentsPerGroup>> {
      debugger;
      return this.http.post<Array<DocumentsPerGroup>>(this.Url + "UploadFewDocumentsPerGroup/"+FolderName, ListDocumentsPerGroup);
    }

    DeleteDocumentPerGroup(iddocumentPerGroup: number, idGroup: number) :Observable<string>{
      debugger;
      return this.http.delete(this.Url + "DeleteDocumentPerGroup/" + iddocumentPerGroup + "/" + idGroup, { responseType: 'text' })
    }

    DeleteFewDocumentPerGroup(FolderId: number ,requiredDocumentPerGroupId:number, GroupId: number):Observable<DocumentsPerGroup> {
      return this.http.delete<DocumentsPerGroup>(this.Url + "DeleteFewDocumentPerGroup/" + FolderId +"/"+ requiredDocumentPerGroupId);
    }

    SaveNameFile(idfile: number, NameFile: string) {
      return this.http.get(this.Url + "SaveNameFile/" + idfile +"/"+ NameFile);
    }
}
