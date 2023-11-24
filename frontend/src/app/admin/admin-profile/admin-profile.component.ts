import { Component, OnInit } from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {FormBuilder} from "@angular/forms";
import {AdminHttpService} from "../../services/admin-http.service";
import {Router} from "@angular/router";
import {Location} from "@angular/common";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css']
})
export class AdminProfileComponent implements OnInit {

  adminId = ''
  firstname = ''
  lastname = ''
  email = ''
  mobileno = ''
  about = ''
  banner = ''
  profile = ''

  constructor(public toastr: ToastrService,
              private formBuilder: FormBuilder,
              public adminhttp: AdminHttpService,
              public router: Router,
              private location: Location) {
    if(localStorage.getItem('Admin')){
      let CurrentAdmin = JSON.parse(localStorage.getItem('Admin'));
      this.adminId = CurrentAdmin.adminId;
    }
  }

  ngOnInit(): void {
    this.get_data()
  }

  get_data(){
    var data = {adminId:this.adminId};
    this.adminhttp.PostAPI('admin/get_data', data).then((resdata: any) => {
      if (resdata.status == 200) {
        var json_data = resdata.data;
        this.firstname = json_data.firstname;
        this.lastname = json_data.lastname;
        this.email = json_data.email;
        this.mobileno = json_data.mobileno;
        this.about = json_data.about;
        this.banner = (json_data.banner != null) ? environment.backend_url+''+json_data.banner : 'assets/images/background-profile-dark.jpg'
        this.profile = (json_data.profile != null) ? environment.backend_url+''+json_data.profile : 'assets/images/icon/users-icon-white.svg'
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
