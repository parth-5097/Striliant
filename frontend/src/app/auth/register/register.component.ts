import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {Router, CanActivate, ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DOCUMENT, Location} from "@angular/common";
import { ToastrService } from 'ngx-toastr';
import {HttpService} from "../../services/http.service";
import {ConfirmedValidator} from "../../confirmed.validator";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {

  submitted = false
  AddForm : FormGroup
  logo_proof = ''
  photo_proof = ''
  business_proof = ''
  logo_file: File;
  photo_file: File;
  business_file: File;
  particlesOptions:any;
  photo_pdfviewer = false
  business_pdfviewer = false

  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    public http: HttpService,
    public router: Router,
    private location: Location,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.particularjs()
    this.document.body.classList.add('custom-body-class');
    this.AddForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required,Validators.email]],
      username: ['', [Validators.required,Validators.pattern(/^\S*$/)]],
      birth_date: [''],
      anniversary_date: [''],
      mobile: ['',[Validators.required,Validators.pattern("^[0-9]*$"),Validators.minLength(10), Validators.maxLength(10)]],
      phone: ['',[Validators.pattern("^[0-9]*$"),Validators.minLength(10), Validators.maxLength(10)]],
      company_name: ['',[Validators.required]],
      company_logo: ['',[Validators.required]],
      designation: ['',[Validators.required]],
      business_type: ['',[Validators.required]],
      country: ['',[Validators.required]],
      state: ['',[Validators.required]],
      city: ['',[Validators.required]],
      zipcode: ['',[Validators.required]],
      address: ['',[Validators.required]],
      fax: [''],
      any_reference: ['',[Validators.required]],
      accept_terms: ['',[Validators.requiredTrue]],
      accept_newsletter: [''],
      password: ['', [Validators.required,Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]]
    }, {
      validator: ConfirmedValidator('password', 'confirm_password')
    });
  }

  particularjs(){
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
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove('custom-body-class');
  }

  get fval() {
    return this.AddForm.controls;
  }

  upload_logo(evt) {
    if (evt.target) {
      this.logo_file = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.logo_proof = event.target.result;
      }
      reader.readAsDataURL(evt.target.files[0]);
    }
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
    if(this.logo_file){
      form_data.append('logo_file',this.logo_file)
    }
    if(this.photo_file){
      form_data.append('photo_file',this.photo_file)
    }
    if(this.business_file){
      form_data.append('business_file',this.business_file)
    }
    this.http.PostAPI('users/sign-up', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.router.navigate(['login']);
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }
}
