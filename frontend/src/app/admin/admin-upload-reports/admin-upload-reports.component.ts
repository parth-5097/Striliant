import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from "angular-datatables";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-admin-upload-reports',
  templateUrl: './admin-upload-reports.component.html',
  styleUrls: ['./admin-upload-reports.component.css']
})
export class AdminUploadReportsComponent implements OnInit {

  adminId = ''
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  folderList:any[]=[];
  constructor(public router: Router, public toastr: ToastrService, public adminhttp: AdminHttpService, private formBuilder: FormBuilder) {
    if(localStorage.getItem('Admin')){
      let CurrentAdmin = JSON.parse(localStorage.getItem('Admin'));
      this.adminId = CurrentAdmin.adminId;
    }
  }

  ngOnInit(): void {
    this.get_data()
  }

  get_data(){
    this.adminhttp.PostAPI('admin/GetFolders', {}).then((resdata: any) => {
      if (resdata.status == 200) {
        this.folderList = resdata.response;
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }
}
