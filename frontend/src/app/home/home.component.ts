import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {HttpService} from "../services/http.service";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  submitted = false;
  AddForm : FormGroup;
  BlogList = ''
  backend = environment.backend_url
  milestoneActive = 0
  testimonialsActive = 0;
  blogActive = 0
  teamActive = 0
  brandsActive = 0
  milestoneslides = [];
  testislides = [];
  slick: any = 1;

  constructor(public toastr: ToastrService, private formBuilder: FormBuilder, public router: Router, public http: HttpService) { }

  ngOnInit(): void {
    this.blog_data()
    this.contactForm()
    this.get_data_milestones()
    this.get_data_testimonials()
    this.get_data_settings()
  }

  slicktogle(val){
    this.slick = val;
  }

  get_data_settings(){
    var data = {};
    this.http.PostAPI('users/GetRecordSettings', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.milestoneActive = parseInt(resdata.data[0].status)
        this.testimonialsActive = parseInt(resdata.data[1].status)
        this.blogActive = parseInt(resdata.data[2].status)
        this.brandsActive = parseInt(resdata.data[3].status)
        this.teamActive = parseInt(resdata.data[4].status)
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  get_data_milestones(){
    var data = {};
    this.http.PostAPI('users/GetRecordMilestones', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.milestoneslides = resdata.data
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  get_data_testimonials(){
    var data = {};
    this.http.PostAPI('users/GetRecordTestimonials', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.testislides = resdata.data
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  milestoneslider = {
    arrows: true,
    dots: false,
    autoplay: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  }

  testislider = {
    arrows: true,
    dots: false,
    autoplay: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  }

  prodnatslider = {
    arrows: true,
    dots: true,
    autoplay: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  }
  prodlabslider = {
    arrows: true,
    dots: true,
    autoplay: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  }

  contactForm(){
    this.AddForm = this.formBuilder.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required,Validators.email]],
      comment: ['', [Validators.required]],
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
    let data = this.AddForm.value;
    this.http.PostAPI('users/contact-us', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.AddForm.reset()
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  blog_data(){
    var data = {limit:3}
    this.http.PostAPI('users/GetBlogList', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.BlogList = resdata.data
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
