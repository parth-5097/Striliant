import { DOCUMENT } from '@angular/common';
import {Component, OnInit, Inject, Renderer2, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {Location} from "@angular/common";
import {AdminHttpService} from "../../services/admin-http.service";

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit, OnDestroy {

  randomcaptcha : number;
  submitted = false;
  AddForm : FormGroup;
  particlesOptions:any
  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    public adminhttp: AdminHttpService,
    public router: Router,
    private location: Location,
    @Inject(DOCUMENT) private document: Document){
  }

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
    this.randomcaptcha = Math.floor(1000 + Math.random() * 9000);
    this.AddForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required,Validators.minLength(6)]],
      captcha: ['', [Validators.required]]
    });
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove('custom-body-class');
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
      this.adminhttp.PostAPI('admin/login', data).then((resdata: any) => {
        if (resdata.status == 200) {
          this.adminhttp.token = resdata.token;
          localStorage.setItem('Admin', JSON.stringify(resdata.data));
          localStorage.setItem('AdminToken', resdata.token);
          this.adminhttp.IsAdminLogin = true;
          this.toastr.success(resdata.message);
          this.router.navigate(['admin/dashboard']);
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
