import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {environment} from "../../environments/environment";
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  token = '';
  IsUserLogin = false;
  backendurl = environment.backend_url;
  frontendurl = environment.frontend_url;
  searchdata:any={};

  constructor(public http: HttpClient, public router: Router) {
  }

  GetAPI(path, data: any) {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
      this.http.get(environment.backend_url + path, { headers: headers, params: data }).subscribe((resdata: any) => {
        resolve(resdata);
      }, (err) => {
        reject(err);
      });
    });
  }
  PostAPI(path, data) {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
      this.http.post(environment.backend_url + path, data, { headers: headers }).subscribe((resdata: any) => {
        resolve(resdata);
      }, (err) => {
        reject(err);
      });
    });
  }
  PutAPI(path, data) {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.token });
      this.http.put(environment.backend_url + path, data, { headers: headers }).subscribe((resdata: any) => {
        resolve(resdata);
      }, (err) => {
        reject(err);
      });
    });
  }
  async downloadfile(path, data){
    const file = await this.http.post<Blob>(environment.backend_url + path, data ,{  headers: new HttpHeaders().set('authorization', 'Bearer ' + this.token),  responseType: 'blob' as 'json'  }).toPromise();
    return file;
  }
  logout(){
    localStorage.removeItem('User');
    localStorage.removeItem('Token');
    this.token = '';
    this.IsUserLogin = false;
    this.router.navigate(['login']);
  }
}
