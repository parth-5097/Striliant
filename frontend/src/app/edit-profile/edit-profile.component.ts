import { Component, OnInit } from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {Location} from "@angular/common";
import {HttpService} from "../services/http.service";
import {environment} from "../../environments/environment";
import {MustMatch} from "../_helpers/must-match.validator";
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;
  show_model = false;
  photo_pdfviewer = false;
  business_pdfviewer = false;
  userId = ''
  firstname = ''
  lastname = ''
  submitted = false;
  picture_submitted = false;
  AddForm : FormGroup;
  photo_proof = ''
  business_proof = ''
  photo_file: File;
  business_file: File;
  password_submitted = false;
  PasswordForm : FormGroup;
  PictureForm : FormGroup;
  company_logo = ''
  show_model1 = false
  company_img = ''
  proofVerified: any = 0;
  constructor(public toastr: ToastrService, private formBuilder: FormBuilder, public router: Router, private location: Location, public http: HttpService) {
    if(localStorage.getItem('User')){
      let CurrentUser = JSON.parse(localStorage.getItem('User'));
      this.userId = CurrentUser.userId;
    }
  }

  ngOnInit(): void {
    this.editForm()
    this.passwordForm()
    this.get_data();
    this.PictureForm = this.formBuilder.group({
      profile: ['', [Validators.required]]
    });
  }
  passwordForm(){
    this.PasswordForm = this.formBuilder.group({
      old_password: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'confirm_password')
    });
  }

  editForm(){
    this.AddForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      birth_date: [''],
      anniversary_date: [''],
      mobile: ['',[Validators.required,Validators.pattern("^[0-9]*$"),Validators.minLength(10), Validators.maxLength(10)]],
      phone: ['',[Validators.pattern("^[0-9]*$"),Validators.minLength(10), Validators.maxLength(10)]],
      company_name: ['',[Validators.required]],
      designation: ['',[Validators.required]],
      business_type: ['',[Validators.required]],
      country: ['',[Validators.required]],
      state: ['',[Validators.required]],
      city: ['',[Validators.required]],
      zipcode: ['',[Validators.required]],
      address: [''],
      fax: [''],
      any_reference: ['',[Validators.required]]
    });
  }

  get_data(){
    var data = {userId:this.userId};
    this.http.PostAPI('users/get_data', data).then((resdata: any) => {
      if (resdata.status == 200) {
        var json_data = resdata.data;
        this.firstname = json_data.firstname;
        this.lastname = json_data.lastname;
        this.proofVerified = json_data.proof_verify;
        console.log('verified::: ' + this.proofVerified)          //log
        this.company_logo = (json_data.company_logo != null) ? environment.backend_url+''+json_data.company_logo : 'assets/images/icon/users-icon-white.svg'
        if(json_data.photo_proof == null){
          this.photo_proof = ''
        }else{
          this.photo_proof = environment.backend_url+''+json_data.photo_proof
        }
        if(json_data.business_proof == null){
          this.business_proof = ''
        }else{
          this.business_proof = environment.backend_url+''+json_data.business_proof
        }
        if(json_data.phone == null){
          json_data.phone = ''
        }
        if(json_data.birth_date == '0000-00-00' || json_data.birth_date == null){
          json_data.birth_date = ''
        }
        if(json_data.anniversary_date == '0000-00-00' || json_data.anniversary_date == null){
          json_data.anniversary_date = ''
        }
        this.AddForm = this.formBuilder.group({
          firstname: [json_data.firstname, [Validators.required]],
          lastname: [json_data.lastname, [Validators.required]],
          birth_date: [json_data.birth_date],
          anniversary_date: [json_data.anniversary_date],
          mobile: [json_data.mobile,[Validators.required,Validators.pattern("^[0-9]*$"),Validators.minLength(10), Validators.maxLength(10)]],
          phone: [json_data.phone,[Validators.pattern("^[0-9]*$"),Validators.minLength(10), Validators.maxLength(10)]],
          company_name: [json_data.company_name,[Validators.required]],
          designation: [json_data.designation,[Validators.required]],
          business_type: [json_data.business_type,[Validators.required]],
          country: [json_data.country,[Validators.required]],
          state: [json_data.state,[Validators.required]],
          city: [json_data.city,[Validators.required]],
          zipcode: [json_data.zipcode,[Validators.required]],
          address: [json_data.address],
          fax: [json_data.fax],
          any_reference: [json_data.any_reference,[Validators.required]]
        });
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

  fileChangeEvent(event: any): void {
    this.company_img = event.target.files[0];
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
  imageLoaded() {
    this.showCropper = true
    // show cropper
  }
  cropperReady(sourceImageDimensions) {
    console.log('Cropper ready', sourceImageDimensions);
  }
  loadImageFailed() {
    // show message
  }

  upload_photo(evt) {
    if (evt.target) {
      this.photo_file = evt.target.files[0];
      var UploadfileName = evt.target.files[0].name
      var ext = UploadfileName.substring(UploadfileName.lastIndexOf('.') + 1);
      if(ext == 'pdf'){
        this.photo_pdfviewer = true
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.photo_proof = UploadfileName
        }
        reader.readAsDataURL(evt.target.files[0]);
      }else {
        this.photo_pdfviewer = false
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.photo_proof = event.target.result;
        }
        reader.readAsDataURL(evt.target.files[0]);
      }
    }
  }

  upload_business(evt) {
    if (evt.target) {
      this.business_file = evt.target.files[0];
      var UploadfileName = evt.target.files[0].name
      var ext = UploadfileName.substring(UploadfileName.lastIndexOf('.') + 1);
      if(ext == 'pdf'){
        this.business_pdfviewer = true
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.business_proof = UploadfileName
        }
        reader.readAsDataURL(evt.target.files[0]);
      }else {
        this.business_pdfviewer = false
        var reader = new FileReader();
        reader.onload = (event: any) => {
          this.business_proof = event.target.result;
        }
        reader.readAsDataURL(evt.target.files[0]);
      }
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
    if(this.userId){
      form_data.append('userId',this.userId)
    }
    this.http.PostAPI('users/updateProfile', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.router.navigate(['profile']);
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
    data.userId = this.userId
    if(data.old_password != data.password){
      this.http.PostAPI('users/change-password', data).then((resdata: any) => {
        if (resdata.status == 200) {
          this.toastr.success(resdata.message);
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
    this.passwordForm()
  }

  close_model(){
    this.show_model = false;
    this.PasswordForm.reset()
  }

  open_model1(){
    this.show_model1 = true;
    this.PictureForm = this.formBuilder.group({
      profile: ['', [Validators.required]]
    });
  }

  close_model1(){
    this.show_model1 = false;
    this.PictureForm.reset()
  }

  get f1() {
    return this.PictureForm.controls;
  }

  upload_logo(evt) {
    if (evt.target) {
      this.company_img = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = (event: any) => {
        //this.company_logo = event.target.result;
      }
      reader.readAsDataURL(evt.target.files[0]);
    }
  }

  onSubmitPicture(){
    this.picture_submitted = true;
    if (this.PictureForm.invalid) {
      return;
    }
    var data = this.PictureForm.value;
    var form_data  = new FormData()
    for ( var key in data ) {
      form_data.append(key, data[key]);
    }
    if(this.company_img){
      form_data.append('company_logo',this.company_img)
    }
    if(this.croppedImage){
      form_data.append('cropProfile',this.croppedImage)
    }
    if(this.userId){
      form_data.append('userId',this.userId)
    }
    this.http.PostAPI('users/profile-picture', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.close_model1();
        this.router.navigate(['profile']);
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
