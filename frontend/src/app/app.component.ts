import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {HttpService} from "./services/http.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private activatedRoute:ActivatedRoute,private router:Router,public http: HttpService){
  }

  ngOnInit(): void {
    var Token = localStorage.getItem('Token');
    if (Token && Token != '') {
      this.http.token = Token;
    }
    var objUser = localStorage.getItem('User');
    if (objUser) {
      this.http.IsUserLogin = true;
    }
  }
}
