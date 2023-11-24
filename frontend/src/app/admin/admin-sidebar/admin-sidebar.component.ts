import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {Location} from "@angular/common";
import {AdminHttpService} from "../../services/admin-http.service";

@Component({
  selector: 'app-admin-sidebar',
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent implements OnInit {

  CurrentUrl = ''
  constructor(public toastr: ToastrService,
              private formBuilder: FormBuilder,
              public adminhttp: AdminHttpService,
              public router: Router,
              private location: Location) {
  }

  ngOnInit(): void {
    this.CurrentUrl = this.router.url
  }

  logout(){
    localStorage.removeItem('Admin');
    localStorage.removeItem('AdminToken');
    this.adminhttp.token = '';
    this.adminhttp.IsAdminLogin = false;
    this.router.navigate(['admin/login']);
  }

}
