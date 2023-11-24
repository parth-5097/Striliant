import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormControl} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import { Router, CanActivate,ActivatedRoute } from '@angular/router';
import {Location} from "@angular/common";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-admin-add-seller',
  templateUrl: './admin-add-seller.component.html',
  styleUrls: ['./admin-add-seller.component.css']
})
export class AdminAddSellerComponent implements OnInit {

  title = 'Add'
  adminId = ''
  submitted = false;
  AddForm : FormGroup;
  photo_proof = ''
  business_proof = ''
  photo_file: File;
  business_file: File;
  constructor(public toastr: ToastrService,
              private formBuilder: FormBuilder,
              public adminhttp: AdminHttpService,
              public router: Router,
              private location: Location,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    const adminId = this.route.snapshot.paramMap.get('adminId');
    this.adminId = adminId;
    this.AddForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: [{value: '', disabled : false}, [Validators.required,Validators.pattern(/^\S*$/)]],
      mobileno: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      about: [''],
      profile: ['']
    });
    if(this.adminId){
      this.title = 'Edit'
      // this.AddForm.controls['email'].disable();
      // this.AddForm.controls['username'].disable();
      this.get_data()
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  get_data(){
    var data = {adminId:this.adminId};
    this.adminhttp.PostAPI('admin/get_data', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.AddForm = this.formBuilder.group({
          firstname: [resdata.data.firstname, [Validators.required]],
          lastname: [resdata.data.lastname, [Validators.required]],
          email: [resdata.data.email, [Validators.required, Validators.email]],
          username: [resdata.data.username, [Validators.required,Validators.pattern(/^\S*$/)]],
          mobileno: [resdata.data.mobileno, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
          about: [resdata.data.about],
          profile: ['']
        });
        this.photo_proof = (resdata.data.profile != null) ? environment.backend_url+''+resdata.data.profile : ''
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  get fval() {
    return this.AddForm.controls;
  }

  upload_photo(evt) {
    if (evt.target) {
      this.photo_file = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.photo_proof = event.target.result;
      }
      reader.readAsDataURL(evt.target.files[0]);
    }
  }

  upload_business(evt) {
    if (evt.target) {
      this.business_file = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.business_proof = event.target.result;
      }
      reader.readAsDataURL(evt.target.files[0]);
    }
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
    if(this.photo_file){
      form_data.append('photo_file',this.photo_file)
    }
    if(this.business_file){
      form_data.append('business_file',this.business_file)
    }
    if(this.adminId){
      form_data.append('adminId',this.adminId)
    }
    this.adminhttp.PostAPI('admin/addSubAdmin', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.router.navigate(['admin/subadmin']);
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
