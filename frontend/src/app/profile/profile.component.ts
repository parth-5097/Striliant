import { Component, OnInit, AfterViewInit } from '@angular/core';
import {HttpService} from '../services/http.service';
import {ToastrService} from 'ngx-toastr';
import {FormBuilder} from '@angular/forms';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {environment} from '../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userId = '';
  firstname = '';
  lastname = '';
  email = '';
  mobile = '';
  phone = '';
  username = '';
  birth_date = '';
  anniversary_date = '';
  company_name = '';
  designation = '';
  business_type = '';
  country = '';
  state = '';
  city = '';
  zipcode = '';
  address = '';
  fax = '';
  any_reference = '';
  company_logo = '';

  constructor(public toastr: ToastrService,
              private formBuilder: FormBuilder,
              private spinner: NgxSpinnerService,
              public router: Router,
              private location: Location,
              public http: HttpService) {
    if (localStorage.getItem('User')){
      let CurrentUser = JSON.parse(localStorage.getItem('User'));
      this.userId = CurrentUser.userId;
    }
  }

  ngOnInit(): void {
    this.get_data();
    this.showSpinner();
  }

  get_data(){
    var data = {userId:this.userId};
    this.http.PostAPI('users/get_data', data).then((resdata: any) => {
      if (resdata.status == 200) {
        var json_data = resdata.data;
        this.firstname = json_data.firstname;
        this.lastname = json_data.lastname;
        this.email = json_data.email;
        this.mobile = json_data.mobile;
        this.phone = (json_data.phone != null && json_data.phone != 0) ? json_data.phone : '';
        this.username = json_data.username;
        this.birth_date = json_data.birth_date;
        this.anniversary_date = json_data.anniversary_date;
        this.company_name = json_data.company_name;
        this.designation = json_data.designation;
        this.business_type = json_data.business_type;
        this.address = json_data.address;
        this.country = json_data.country;
        this.state = json_data.state;
        this.city = json_data.city;
        this.zipcode = json_data.zipcode;
        this.fax = json_data.fax;
        this.any_reference = json_data.any_reference;
        this.company_logo = (json_data.company_logo != null) ? environment.backend_url+''+json_data.company_logo : 'assets/images/icon/users-icon-white.svg'
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }


  // tslint:disable-next-line:use-lifecycle-interface
  ngAfterViewInit(): void{
    this.spinner.hide();
  }

  showSpinner() {
    this.spinner.show();
  }
}
