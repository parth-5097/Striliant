import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-our-story',
  templateUrl: './our-story.component.html',
  styleUrls: ['./our-story.component.css']
})
export class OurStoryComponent implements OnInit {

  slick: any = 1;

  constructor() { }

  ngOnInit(): void {
    $(document).ready(() => {
      $(window).scrollTop(0);
    });
  }

  slicktogle(val){
    this.slick = val;
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
  };
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
  };
}
