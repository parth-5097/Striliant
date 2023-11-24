import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {HttpService} from '../services/http.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css']
})
export class ContactUsComponent implements OnInit {

  submitted = false;
  AddForm: FormGroup;
  login = false;
  constructor(public toastr: ToastrService, private formBuilder: FormBuilder, public router: Router, public http: HttpService) { }

  // tslint:disable-next-line:typedef
  isLogin(){
    try{
      const token = localStorage.getItem('Token');
      const userId = localStorage.getItem('User');
      this.login = JSON.parse(userId).type === 3;
    } catch (e){
      this.login = false;
    }
  }

  ngOnInit(): void {
    this.contactForm();
    this.isLogin();
    $(document).ready(() => {
      $(window).scrollTop(0);
    });
  }

  // tslint:disable-next-line:typedef
  contactForm(){
    this.AddForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      comment: ['', [Validators.required]],
    });
  }

  // tslint:disable-next-line:typedef
  get fval() {
    return this.AddForm.controls;
  }

  // tslint:disable-next-line:typedef
  onSubmit(){
    this.submitted = true;
    if (this.AddForm.invalid) {
      return;
    }
    const data = this.AddForm.value;
    this.http.PostAPI('users/contact-us', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.AddForm.reset();
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
