import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';
import {environment} from "../../../environments/environment";
import {ConfirmedValidator} from "../../confirmed.validator";

@Component({
  selector: 'app-admin-add-customer',
  templateUrl: './admin-add-customer.component.html',
  styleUrls: ['./admin-add-customer.component.css']
})
export class AdminAddCustomerComponent implements OnInit {

  title = 'Add'
  userId = ''
  submitted = false;
  proofVerify = '';
  AddForm : FormGroup;
  public options: Options;
  public Tags: Array<Select2OptionData>;
  public selectedTags: string[];
  constructor(public toastr: ToastrService,
              private formBuilder: FormBuilder,
              public adminhttp: AdminHttpService,
              public router: Router,
              private location: Location,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    this.userId = userId;
    this.AddForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required,Validators.pattern(/^\S*$/)]],
      mobile: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      company_name: ['', [Validators.required]],
      designation: ['', [Validators.required]],
      business_type: ['', [Validators.required]],
      country: ['', [Validators.required]],
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      zipcode: ['', [Validators.required]],
      address: ['', [Validators.required]],
      notes: [''],
      tags: [''],
      password: ['', [Validators.required,Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]]
    }, {
      validator: ConfirmedValidator('password', 'confirm_password')
    });
    if(this.userId){
      this.title = 'Edit'
      //this.AddForm.controls['email'].disable();
      //this.AddForm.controls['username'].disable();
      this.get_data()
    }
    this.options = {
      width: '1290',
      multiple: true,
      tags: true
    };
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  get_data(){
    var data = {userId:this.userId};
    this.adminhttp.PostAPI('admin/GetCustomer', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.proofVerify = resdata.data.proof_verify
        if(resdata.data.notes == null || resdata.data.notes == 'null'){
          resdata.data.notes = ''
        }
        if(resdata.data.tags != null && resdata.data.tags != 'null'){
          this.Tags = resdata.data.tags.split(",")
          this.selectedTags = resdata.data.tags.split(",")
        }
        this.AddForm = this.formBuilder.group({
          firstname: [resdata.data.firstname, [Validators.required]],
          lastname: [resdata.data.lastname, [Validators.required]],
          email: [resdata.data.email, [Validators.required, Validators.email]],
          username: [resdata.data.username, [Validators.required,Validators.pattern(/^\S*$/)]],
          mobile: [resdata.data.mobile, [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
          company_name: [resdata.data.company_name, [Validators.required]],
          designation: [resdata.data.designation, [Validators.required]],
          business_type: [resdata.data.business_type, [Validators.required]],
          country: [resdata.data.country, [Validators.required]],
          state: [resdata.data.state, [Validators.required]],
          city: [resdata.data.city, [Validators.required]],
          zipcode: [resdata.data.zipcode, [Validators.required]],
          address: [resdata.data.address, [Validators.required]],
          notes: [resdata.data.notes],
          tags: [],
          password: ['', [Validators.minLength(6)]],
          confirm_password: ['']
        }, {
          validator: ConfirmedValidator('password', 'confirm_password')
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
    if(this.userId){
      form_data.append('userId',this.userId)
    }

    this.adminhttp.PostAPI('admin/addUser', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.router.navigate(['admin/customers']);
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  /*proofVerifyData(){
    var data = {userId: this.userId};
    this.http.PostAPI('admin/', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.RequestsDetails =  resdata.data;
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }*/

}
