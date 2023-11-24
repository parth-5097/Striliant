import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-admin-home-settings',
  templateUrl: './admin-home-settings.component.html',
  styleUrls: ['./admin-home-settings.component.css']
})
export class AdminHomeSettingsComponent implements OnInit {

  HomeSettings = ''
  constructor(public router: Router, public toastr: ToastrService, public adminhttp: AdminHttpService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.get_data()
  }

  get_data(){
    var data = {};
    this.adminhttp.PostAPI('admin/GetRecordSettings', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.HomeSettings =  resdata.data
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  change_status(key) {
    var data = { key: key }
    this.adminhttp.PostAPI('admin/SettingsChangeStatus', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
      } else {
        this.toastr.error(resdata.message)
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
