import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";

@Component({
  selector: 'app-admin-add-upload-reports',
  templateUrl: './admin-add-upload-reports.component.html',
  styleUrls: ['./admin-add-upload-reports.component.css']
})
export class AdminAddUploadReportsComponent implements OnInit {

  submitted = false;
  AddForm : FormGroup;
  filesToUpload:Array<File> = [];
  images = [];
  constructor(public toastr: ToastrService,
              private formBuilder: FormBuilder,
              public adminhttp: AdminHttpService,
              public router: Router,
              private location: Location,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.AddForm = this.formBuilder.group({
      folder: ['', [Validators.required]],
      upload_file: ['', [Validators.required]]
    });
  }

  get fval() {
    return this.AddForm.controls;
  }

  onFileChange(event) {
    if (event.target.files && event.target.files[0]) {
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        this.filesToUpload.push(event.target.files[i]);
        var reader = new FileReader();
        reader.onload = () => {
          this.images.push(event.target.files[i]);
        }
        reader.readAsDataURL(event.target.files[i]);
      }
    }
  }

  removeimgefromarray(index){
    var new_arr = [];
    for (let i = 0; i < this.images.length; i++)
    {
      if(i!=index)
      {
        new_arr.push(this.images[i]);
      }
    }
    this.images = new_arr;
    this.filesToUpload = new_arr
  }

  onSubmit(){
    this.submitted = true;
    if (this.AddForm.invalid) {
      return;
    }
    var data = this.AddForm.value;
    var form_data  = new FormData()
    for ( var key in data ) {
      form_data.append(key, data[key]);
    }
    if(this.filesToUpload){
      var files: Array<File> = this.filesToUpload;
      for(let i =0; i < files.length; i++){
        form_data.append('upload_file', files[i]);
      }
    }
    this.adminhttp.PostAPI('admin/addReports', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.router.navigate(['admin/upload-reports']);
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
