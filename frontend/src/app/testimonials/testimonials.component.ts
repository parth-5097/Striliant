import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import {HttpService} from '../services/http.service';
import {ToastrService} from "ngx-toastr";


@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent implements OnInit {

  testimonialData: any = [];

  constructor(public http: HttpService, public toastr: ToastrService) { }

  ngOnInit(): void {
    $(document).ready(function(){
      $(window).scrollTop(0);
    });
    this.get_data_testimonials();
  }

  get_data_testimonials(){
    var data = {};
    this.http.PostAPI('users/GetRecordTestimonials', data).then((resdata: any) => {
      if (resdata.status == 200) {
        console.log('testidata: ', JSON.stringify(resdata['data']))
        this.testimonialData = resdata['data'];
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  Date(val){
    return new Date(val).toISOString().slice(0,10);
  }
}
