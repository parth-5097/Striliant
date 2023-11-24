import { Component, OnInit } from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {FormBuilder, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {HttpService} from "../services/http.service";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-blog-details',
  templateUrl: './blog-details.component.html',
  styleUrls: ['./blog-details.component.css']
})
export class BlogDetailsComponent implements OnInit {

  title = ''
  description = ''
  blog_img = ''
  blogId = ''
  created_at = ''
  constructor(public toastr: ToastrService, private formBuilder: FormBuilder, public router: Router, public http: HttpService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const blogId = this.route.snapshot.paramMap.get('blogId');
    this.blogId = blogId;
    this.get_data()
  }

  get_data(){
    var data = {blogId:this.blogId};
    this.http.PostAPI('users/GetRecordBlog', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.title = resdata.data.title
        this.description = resdata.data.description
        this.created_at = resdata.data.created_at
        this.blog_img = environment.backend_url +''+ resdata.data.image;
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
