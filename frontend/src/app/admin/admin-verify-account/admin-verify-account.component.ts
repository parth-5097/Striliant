import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {ActivatedRoute, Router} from '@angular/router';
import {MustMatch} from '../../_helpers/must-match.validator';
import {AdminHttpService} from "../../services/admin-http.service";

@Component({
  selector: 'app-admin-verify-account',
  templateUrl: './admin-verify-account.component.html',
  styleUrls: ['./admin-verify-account.component.css']
})
export class AdminVerifyAccountComponent implements OnInit {

  randomcaptcha : number;
  submitted = false;
  AddForm : FormGroup;
  verify_token = ''
  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    public adminhttp: AdminHttpService,
    public router: Router,
    private route: ActivatedRoute
  ) {
    if(this.route.snapshot.params['Token']){
      this.verify_token = this.route.snapshot.params['Token'];
    }
  }

  ngOnInit(): void {
    this.randomcaptcha = Math.floor(1000 + Math.random() * 9000);
    this.AddForm = this.formBuilder.group({
      captcha: ['', [Validators.required]],
      password: ['', [Validators.required,Validators.minLength(6)]],
      confirm_password: ['', Validators.required]
    }, {
      validator: MustMatch('password', 'confirm_password')
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
    var verify = this.AddForm.value.captcha
    if(verify == this.randomcaptcha){
      data.verify_token = this.verify_token
      this.adminhttp.PostAPI('admin/verify-account', data).then((resdata: any) => {
        if (resdata.status == 200) {
          this.toastr.success(resdata.message);
          this.router.navigate(['admin/login']);
        } else {
          this.toastr.error(resdata.message);
        }
      }).catch((err) => {
        this.toastr.error(err);
      });
    }else{
      this.toastr.error('Please correct captcha value');
    }
  }

}
