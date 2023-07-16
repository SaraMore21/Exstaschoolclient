import { DocumentsPerStudent } from './../Class/documents-per-student';
import { HttpClient, HttpErrorResponse  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GlobalServiceService } from './global-service.service';

@Injectable({
  providedIn: 'root'
})
export class FilesAzureService {

  constructor(private http: HttpClient,   private globalService: GlobalServiceService    ) { }

  Url =environment.API_ENDPOINT+ "api/FilesAzure/";
  // Url = "api/FilesAzure/";

  tokenAzure: string = "?sp=r&st=2021-09-05T07:09:22Z&se=4000-01-01T16:09:22Z&spr=https&sv=2020-08-04&sr=c&sig=rfQUXoumLEarC%2BNrpsSX1d0tH%2FmupgC%2F0QWn4qpq49k%3D";
  uploadFileToAzure(fileD: File, path: string, SchoolID: number) {
    debugger;
    const formData = new FormData();
    formData.append('file', fileD, fileD.name);

    // const res =  this.http.post(this.Url + "Upload?path=" + path, formData).toPromise().catch((err: HttpErrorResponse) => {
    //   const error = err.error;
    //   return error;
    // });
    // return res;
debugger;
    return this.http.post(this.Url + "Upload?path=" + path, formData, { responseType: 'text' })
  }

  DownloadFileFromAzure(path: string) {
    debugger;
    path = path.substring(66);
    let i = path.indexOf('?');
    path = path.substring(0, i);

    let re = /\//gi;
    let res = path.replace(re, '!');

    return this.http.get(this.Url + "Download/" + res, { responseType: 'blob' });
  }

  DeleteFileFromAzure(path: string, cut: boolean = true) {
    if (cut) {
      path = path.substring(66);
      let i = path.indexOf('?');
      if (i > -1)
        path = path.substring(0, i);
    }
    let re = /\//gi;
    let res = path.replace(re, '!');

    return this.http.get(this.Url + "delete/" + res, { responseType: 'blob' });
  }

  public siteUrl: string = this.globalService.sharePointPageObject.webAbsoluteUrl;
  public siteRelativeUrl: string = this.globalService.sharePointPageObject.webAbsoluteUrl != "/" ? this.globalService.sharePointPageObject.webAbsoluteUrl : "";
  public fileUpload(file: any, documentLibrary: string, fileName: string) {
    return new Promise((resolve, reject) => {
      this.createDummyFile(fileName, documentLibrary).then(result => {
        let fr = new FileReader();
        let offset = 0;
        // the total file size in bytes...
        let total = file.size;
        // 1MB Chunks as represented in bytes (if the file is less than a MB, seperate it into two chunks of 80% and 20% the size)...
        let length = 1000000 > total ? Math.round(total * 0.8) : 1000000
        let chunks = [];
        //reads in the file using the fileReader HTML5 API (as an ArrayBuffer) - readAsBinaryString is not available in IE!
        fr.readAsArrayBuffer(file);
        fr.onload = (evt: any) => {
          while (offset < total) {
            //if we are dealing with the final chunk, we need to know...
            if (offset + length > total) {
              length = total - offset;
            }
            //work out the chunks that need to be processed and the associated REST method (start, continue or finish)
            chunks.push({
              offset,
              length,
              method: this.getUploadMethod(offset, length, total)
            });
            offset += length;
          }
          //each chunk is worth a percentage of the total size of the file...
           const chunkPercentage = (total / chunks.length) / total * 100;
          console.log("Chunk Percentage: "+chunkPercentage);
          if (chunks.length > 0) {
            //the unique guid identifier to be used throughout the upload session
            const id = this.generateGUID();
            //Start the upload - send the data to S
            this.uploadFile(evt.target.result, id, documentLibrary, fileName, chunks, 0, 0, chunkPercentage, resolve, reject);
          }
        };
      })
    });
  }

  createDummyFile(fileName, libraryName) {
    debugger;
    return new Promise((resolve, reject) => {
      // Construct the endpoint - The GetList method is available for SharePoint Online only.
      var serverRelativeUrlToFolder = "decodedurl='" + this.siteRelativeUrl + "/" + libraryName + "'";

      var endpoint = this.Url + "Upload?path=1452";
      const headers = {
        "accept": "application/json;odata=verbose"
      };
      this.executePost(endpoint, this.convertDataBinaryString(2), headers).then(file => resolve(true)).catch(err => reject(err));
    });
  }
  // Base64 - this method converts the blob arrayBuffer into a binary string to send in the REST request
  convertDataBinaryString(data) {
    let fileData = '';
    let byteArray = new Uint8Array(data);
    for (var i = 0; i < byteArray.byteLength; i++) {
      fileData += String.fromCharCode(byteArray[i]);
    }
    return fileData;
  }
  //this method sets up the REST request and then sends the chunk of file along with the unique indentifier (uploadId)
  uploadFileChunk(id, libraryPath, fileName, chunk, data, byteOffset) {
    return new Promise((resolve, reject) => {
      let offset = chunk.offset === 0 ? '' : ',fileOffset=' + chunk.offset;
      //parameterising the components of this endpoint avoids the max url length problem in SP (Querystring parameters are not included in this length)
      let endpoint = this.siteUrl + "/_api/web/getfilebyserverrelativeurl('" + this.siteRelativeUrl + "/" + libraryPath + "/" + fileName + "')/" + chunk.method + "(uploadId=guid'" + id + "'" + offset + ")";
      const headers = {
        "Accept": "application/json; odata=verbose",
        "Content-Type": "application/octet-stream"
      };
      this.executePost(endpoint, data, headers).then(offset => resolve(offset)).catch(err => reject(err));
    });
  }
  //the primary method that resursively calls to get the chunks and upload them to the library (to make the complete file)
  uploadFile(result, id, libraryPath, fileName, chunks, index, byteOffset, chunkPercentage, resolve, reject) {
    //we slice the file blob into the chunk we need to send in this request (byteOffset tells us the start position)
    const data = this.convertFileToBlobChunks(result, chunks[index]);
    //upload the chunk to the server using REST, using the unique upload guid as the identifier
    this.uploadFileChunk(id, libraryPath, fileName, chunks[index], data, byteOffset).then(value => {
      const isFinished = index === chunks.length - 1;
      index += 1;
      const percentageComplete = isFinished ? 100 : Math.round((index * chunkPercentage));
      console.log("Percentage Completed:" +percentageComplete)
      //More chunks to process before the file is finished, continue
      if (index < chunks.length) {
        this.uploadFile(result, id, libraryPath, fileName, chunks, index, byteOffset, chunkPercentage, resolve, reject);
      } else {
        resolve(value);
      }
    }).catch(err => {
      console.log('Error in uploadFileChunk! ' + err);
      reject(err);
    });
  }
  //Helper method - depending on what chunk of data we are dealing with, we need to use the correct REST method...
  getUploadMethod(offset, length, total) {
    if (offset + length + 1 > total) {
      return 'finishupload';
    } else if (offset === 0) {
      return 'startupload';
    } else if (offset < total) {
      return 'continueupload';
    }
    return null;
  }
  //this method slices the blob array buffer to the appropriate chunk and then calls off to get the BinaryString of that chunk
  convertFileToBlobChunks(result, chunkInfo) {
    return result.slice(chunkInfo.offset, chunkInfo.offset + chunkInfo.length);
  }
  generateGUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
  async executePost(url, data, requestHeaders) {
    const res = await this.http.post(url, data, requestHeaders).toPromise().catch((err: HttpErrorResponse) => {
      const error = err.error;
      return error;
    });
    return this.parseRetSingle(res);
  }
  parseRetSingle(res) {
    if (res) {
      if (res.hasOwnProperty('d')) {
        return res.d;
      } else if (res.hasOwnProperty('error')) {
        const obj: any = res.error;
        obj.hasError = true;
        return obj;
      } else {
        return {
          hasError: true,
          comments: res
        };
      }
    } else {
      return {
        hasError: true,
        comments: 'Check the response in network trace'
      };
    }
  }

}
