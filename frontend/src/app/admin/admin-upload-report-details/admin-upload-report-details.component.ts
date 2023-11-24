import { Component, OnInit } from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {FormBuilder} from "@angular/forms";
import {AdminHttpService} from "../../services/admin-http.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-admin-upload-report-details',
  templateUrl: './admin-upload-report-details.component.html',
  styleUrls: ['./admin-upload-report-details.component.css']
})
export class AdminUploadReportDetailsComponent implements OnInit {

  folderName = ''
  images = []
  constructor(public toastr: ToastrService,
              private formBuilder: FormBuilder,
              public adminhttp: AdminHttpService,
              public router: Router,
              private location: Location,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    const folderName = this.route.snapshot.paramMap.get('folderName');
    this.folderName = folderName;
    this.get_data()
  }

  get_data(){
    var data = {folderName:this.folderName}
    this.adminhttp.PostAPI('admin/GetSubFolders', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.images = resdata.response
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  removefiles(fileName){
    Swal.fire({
      title: "",
      text: "",
      type: 'warning',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.value) {
        var data = {folderName:this.folderName,fileName:fileName}
        this.adminhttp.PostAPI('admin/removeFiles', data).then((resdata: any) => {
          if (resdata.status == 200) {
            if(this.images.length == 1){
              this.images = []
            }
            this.get_data()
            this.toastr.success(resdata.message);
          } else {
            this.toastr.error(resdata.message)
          }
        }).catch((err) => {
          return err;
        });
      }
      return result;
    });
  }

}
