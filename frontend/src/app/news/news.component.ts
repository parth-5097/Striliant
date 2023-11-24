import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {HttpService} from "../services/http.service";

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {

  step:number=1;
  articles = ''
  category = ''
  search = ''
  slides = [
    {title:"Latest Articles", step_number:1},
    {title:"Mining", step_number:2},
    {title:"Rough Markets", step_number:3},
    {title:"Polished Markets", step_number:4},
    {title:"Manufacturing", step_number:5},
    {title:"Research", step_number:6},
    {title:"Retail", step_number:7}
  ];

  constructor(public router: Router, public toastr: ToastrService, public http: HttpService) { }

  ngOnInit(): void {
    this.checkstep(1)
  }

  newsslider = {
    arrows: true,
    dots: false,
    infinite: false,
    cssEase: "cubic-bezier(0.7, 0, 0.3, 1)",
    touchThreshold: 500,
    autoplay: false,
    autoplaySpeed: 2000,
    loop: false,
    slidesToShow: 6,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1500,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 6,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      }
    ]
  }

  searchNews(val){
    this.search = val
    this.get_data();
  }


  checkstep(step){
    this.step = step
    if(this.step == 1){
      this.category = 'Latest Articles'
    }
    if(this.step == 2){
      this.category = 'Mining'
    }
    if(this.step == 3){
      this.category = 'Rough Markets'
    }
    if(this.step == 4){
      this.category = 'Polished Markets'
    }
    if(this.step == 5){
      this.category = 'Manufacturing'
    }
    if(this.step == 6){
      this.category = 'Research'
    }
    if(this.step == 7){
      this.category = 'Retail'
    }
    this.get_data()
  }

  get_data(){
    var data = {category: this.category, search: this.search};

    this.http.PostAPI('users/getNews', data).then((resdata: any) => {
      if (resdata.status == 200) {
        var json_data = resdata.news
        this.articles = json_data.data.articles
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }
}
