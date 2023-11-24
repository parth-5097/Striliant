import { Component, OnInit } from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {FormBuilder} from "@angular/forms";
import {Router} from "@angular/router";
import {HttpService} from "../services/http.service";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {

  BlogList = ''
  backend = environment.backend_url
  constructor(public toastr: ToastrService, private formBuilder: FormBuilder, public router: Router, public http: HttpService) { }

  ngOnInit(): void {
    this.get_data()
    $(document).ready(function(){
      $(window).scrollTop(0);
    });
  }

  get_data(){
    var data = {}
    this.http.PostAPI('users/GetBlogList', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.BlogList = resdata.data
      } else {
        this.toastr.error(resdata.message)
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
