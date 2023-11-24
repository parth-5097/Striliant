import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {HttpService} from "../services/http.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(public router: Router, public toastr: ToastrService, public http: HttpService) { }

  ngOnInit(): void {
  }

  logout(){
    localStorage.removeItem('User');
    localStorage.removeItem('Token');
    this.http.token = '';
    this.http.IsUserLogin = false;
    this.router.navigate(['login']);
  }

}
