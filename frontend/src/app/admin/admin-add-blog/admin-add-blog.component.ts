import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-admin-add-blog',
  templateUrl: './admin-add-blog.component.html',
  styleUrls: ['./admin-add-blog.component.css']
})
export class AdminAddBlogComponent implements OnInit {

  title = 'Add'
  blogId = ''
  blog_img = ''
  submitted = false;
  AddForm : FormGroup;
  image: File;
  constructor(public toastr: ToastrService,
              private formBuilder: FormBuilder,
              public adminhttp: AdminHttpService,
              public router: Router,
              private location: Location,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    const blogId = this.route.snapshot.paramMap.get('blogId');
    this.blogId = blogId;
    this.AddForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      image: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
    if(this.blogId){
      this.title = 'Edit'
      this.get_data()
    }
  }

  get_data(){
    var data = {blogId:this.blogId};
    this.adminhttp.PostAPI('admin/GetRecordBlog', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.blog_img = environment.backend_url +''+ resdata.data.image;
        this.AddForm = this.formBuilder.group({
          title: [resdata.data.title, [Validators.required]],
          image: [''],
          description: [resdata.data.description, [Validators.required]],
        });
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  get fval() {
    return this.AddForm.controls;
  }

  upload_photo(evt) {
    if (evt.target) {
      this.image = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.blog_img = event.target.result;
      }
      reader.readAsDataURL(evt.target.files[0]);
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
    if(this.image){
      form_data.append('blogImg',this.image)
    }
    if(this.blogId){
      form_data.append('blogId',this.blogId)
    }
    this.adminhttp.PostAPI('admin/addBlog', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.router.navigate(['admin/blog']);
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
