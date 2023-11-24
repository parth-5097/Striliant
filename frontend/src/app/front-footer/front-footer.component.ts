import { Component, OnInit } from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {HttpService} from "../services/http.service";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-front-footer',
  templateUrl: './front-footer.component.html',
  styleUrls: ['./front-footer.component.css']
})
export class FrontFooterComponent implements OnInit {

  brandsActive = 0
  Brands = ''
  backend = environment.backend_url
  submitted = false;
  SubscriberForm : FormGroup;
  constructor(public toastr: ToastrService, private formBuilder: FormBuilder, public router: Router, public http: HttpService) { }

  ngOnInit(): void {
    this.SubscriberForm = this.formBuilder.group({
      subscriber_email: ['', [Validators.required, Validators.email]],
    });
    this.get_data_settings()
    this.get_data_brands()
  }

  get_data_settings(){
    var data = {};
    this.http.PostAPI('users/GetRecordSettings', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.brandsActive = parseInt(resdata.data[3].status)
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  get_data_brands(){
    var data = {};
    this.http.PostAPI('users/GetRecordBrands', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.Brands = resdata.data
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  get fval() {
    return this.SubscriberForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.SubscriberForm.invalid) {
      return;
    }
    var data = this.SubscriberForm.value;
    this.http.PostAPI('users/subscriberMail', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.SubscriberForm.reset()
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
