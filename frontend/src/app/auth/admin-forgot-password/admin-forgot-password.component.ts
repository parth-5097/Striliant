import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import { FormGroup, FormControl, Validators, FormBuilder, FormGroupDirective  } from '@angular/forms';
import {AdminHttpService} from "../../services/admin-http.service";
import {ConfirmedValidator} from "../../confirmed.validator";
import {DOCUMENT} from "@angular/common";

@Component({
  selector: 'app-admin-forgot-password',
  templateUrl: './admin-forgot-password.component.html',
  styleUrls: ['./admin-forgot-password.component.css']
})
export class AdminForgotPasswordComponent implements OnInit {

  show_forget_form = true
  verify_form_open = false
  password_form_show = false

  forgot_submitted = false
  verify_submitted = false
  password_submitted = false

  ForgotForm : FormGroup
  verifyForm : FormGroup
  password_Form : FormGroup

  verify_number_global = ''
  user_email : string
  particlesOptions:any
  constructor(public router: Router, public toastr: ToastrService, public adminhttp: AdminHttpService, private formBuilder: FormBuilder,  @Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    this.document.body.classList.add('bg-body-class');
    this.document.body.classList.add('custom-body-class');
    this.particlesOptions = {
      particles: {
        number: { value: 75, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle", stroke: { width: 0, color: "#000000" }, polygon: { nb_sides: 5 }, image: { src: "img/github.svg", width: 100, height: 100 } },
        opacity: { value: 0.1, random: false, anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false } },
        size: { value: 3, random: true, anim: { enable: false, speed: 40, size_min: 0.1, sync: false } },
        line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.2, width: 1 },
        move: { enable: true, speed: 6, direction: "none", random: false, straight: false, out_mode: "out", bounce: false, attract: { enable: false, rotateX: 600, rotateY: 1200 } },
      },
      interactivity: {
        detect_on: "canvas",
        events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
        modes: {
          grab: { distance: 400, line_linked: { opacity: 1 } },
          bubble: { distance: 400, size: 40, duration: 2, opacity: 4, speed: 3 },
          repulse: { distance: 200, duration: 0.4 },
          push: { particles_nb: 4 },
          remove: { particles_nb: 2 },
        },
      },
      retina_detect: true,
    };
    this.login_verify()
    this.token_verify()
    this.password_verify()
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove('custom-body-class');
  }

  get fval() {
    return this.ForgotForm.controls;
  }

  get pval() {
    return this.password_Form.controls;
  }

  get vval() {
    return this.verifyForm.controls;
  }

  login_verify(){
    this.ForgotForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  token_verify(){
    this.verifyForm = this.formBuilder.group({
      verify_token: ['', [Validators.required]]
    })
  }
  password_verify(){
    this.password_Form = this.formBuilder.group({
      password: ['', [Validators.required,Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]]
    }, {
      validator: ConfirmedValidator('password', 'confirm_password')
    });
  }

  onSubmitForgotForm() {
    this.forgot_submitted = true;
    if (this.ForgotForm.invalid) {
      return;
    }
    var data = this.ForgotForm.value;
    this.user_email = data.email
    this.adminhttp.PostAPI('admin/forgot-password', data).then((resdata: any) => {
      this.verify_form_open = true
      if (resdata.status == 200) {
        this.show_forget_form = false
        this.verify_form_open = true
        this.toastr.success(resdata.message)
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  onSubmitVerifyCheck(){
    this.verify_submitted = true;
    if (this.verifyForm.invalid) {
      return;
    }
    var data  = {email: this.user_email, verify_token : this.verifyForm.value.verify_token}
    this.verify_number_global = this.verifyForm.value.verify_token;
    this.adminhttp.PostAPI('admin/verify-otp', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.verify_form_open = false
        this.password_form_show = true
        this.toastr.success(resdata.message)
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  onSubmitPasswordForm(){
    this.password_submitted = true;
    if (this.password_Form.invalid) {
      return;
    }
    var data = this.password_Form.value
    data['email'] = this.user_email
    data['verify_token'] =  this.verify_number_global
    this.adminhttp.PostAPI('admin/reset-password', data).then((resdata: any) => {
      this.verify_form_open = true
      if (resdata.status == 200) {
        this.toastr.success(resdata.message)
        this.router.navigate(['/admin/login']);
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
