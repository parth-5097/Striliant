import { Component, OnInit } from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AdminHttpService} from '../../services/admin-http.service';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import { MustMatch } from '../../_helpers/must-match.validator';
import {environment} from '../../../environments/environment';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-admin-edit-profile',
  templateUrl: './admin-edit-profile.component.html',
  styleUrls: ['./admin-edit-profile.component.css']
})
export class AdminEditProfileComponent implements OnInit {

  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;
  adminId = '';
  firstname = '';
  lastname = '';
  email = '';
  mobileno = '';
  about = '';
  submitted = false;
  AddForm: FormGroup;
  profile = '';
  banner = '';
  profile_file: File;
  banner_file: File;
  picture_submitted = false;
  PictureForm: FormGroup;
  password_submitted = false;
  PasswordForm: FormGroup;
  show_model = false;
  show_model1 = false;

  constructor(public toastr: ToastrService,
              private formBuilder: FormBuilder,
              public adminhttp: AdminHttpService,
              public router: Router,
              private location: Location) {
    if (localStorage.getItem('Admin')){
      let CurrentAdmin = JSON.parse(localStorage.getItem('Admin'));
      this.adminId = CurrentAdmin.adminId;
    }
  }

  ngOnInit(): void {
    this.AddForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      mobileno: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      about: [''],
    });
    this.PictureForm = this.formBuilder.group({
      profile: [''],
      banner: ['']
    });
    this.PasswordForm = this.formBuilder.group({
      old_password: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'confirm_password')
    });
    this.get_data();
  }

  fileChangeEvent(event: any): void {
    this.profile_file = event.target.files[0];
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded() {
    this.showCropper = true;
    // show cropper
  }
  cropperReady(sourceImageDimensions) {
    console.log('Cropper ready', sourceImageDimensions);
  }
  loadImageFailed() {
    // show message
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
        this.AddForm = this.formBuilder.group({
          firstname: [this.firstname, [Validators.required]],
          lastname: [this.lastname, [Validators.required]],
          mobileno: [this.mobileno, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
          about: [this.about]
        });
        this.banner = (json_data.banner != null) ? environment.backend_url + '' + json_data.banner : 'assets/images/Group-2631.jpg';
        this.profile = (json_data.profile != null) ? environment.backend_url + '' + json_data.profile : 'assets/images/icon/users-icon-white.svg';
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

  get f() {
    return this.PasswordForm.controls;
  }

  get f1() {
    return this.PictureForm.controls;
  }

  upload_photo(evt) {
    if (evt.target) {
      this.profile_file = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = (event: any) => {
        //this.profile = event.target.result;
      };
      reader.readAsDataURL(evt.target.files[0]);
    }
  }

  upload_banner(evt) {
    if (evt.target) {
      this.banner_file = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = (event: any) => {
        //this.banner = event.target.result;
      };
      reader.readAsDataURL(evt.target.files[0]);
    }
  }

  onSubmit(){
    this.submitted = true;
    if (this.AddForm.invalid) {
      return;
    }
    var data = this.AddForm.value;
    var form_data  = new FormData();
    for ( var key in data ) {
      form_data.append(key, data[key]);
    }
    if (this.adminId){
      form_data.append('adminId', this.adminId);
    }
    this.adminhttp.PostAPI('admin/edit-profile', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.router.navigate(['admin/profile']);
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  onSubmitPicture(){
    this.picture_submitted = true;
    if (this.PictureForm.invalid) {
      return;
    }
    var data = this.PictureForm.value;
    var form_data  = new FormData();
    for ( var key in data ) {
      form_data.append(key, data[key]);
    }
    if (this.profile_file){
      form_data.append('profile', this.profile_file);
    }
    if (this.croppedImage){
      form_data.append('cropProfile', this.croppedImage);
    }
    if(this.banner_file){
      form_data.append('banner', this.banner_file);
    }
    if (this.adminId){
      form_data.append('adminId', this.adminId);
    }
    this.adminhttp.PostAPI('admin/profile-picture', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.close_model1();
        this.router.navigate(['admin/profile']);
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  onSubmitPassword(){
    this.password_submitted = true
    if(this.PasswordForm.invalid){
      return;
    }
    var data = this.PasswordForm.value;
    data.adminId = this.adminId;
    if (data.old_password != data.password){
      this.adminhttp.PostAPI('admin/change-password', data).then((resdata: any) => {
        if (resdata.status == 200) {
          this.toastr.success(resdata.message);
          this.close_model();
        } else {
          this.toastr.error(resdata.message);
        }
      }).catch((err) => {
        this.toastr.error(err);
      });
    }else{
      this.toastr.error('Please Old Password not Enter a New Password');
    }
  }

  open_model(){
    this.show_model = true;
    this.PasswordForm = this.formBuilder.group({
      old_password: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'confirm_password')
    });
  }

  close_model(){
    this.show_model = false;
    this.PasswordForm.reset();
  }

  open_model1(){
    this.show_model1 = true;
    this.PictureForm = this.formBuilder.group({
      profile: [''],
      banner: ['']
    });
  }

  close_model1(){
    this.show_model1 = false;
    this.PictureForm.reset();
  }

}
