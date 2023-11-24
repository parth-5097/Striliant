import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-admin-add-testimonials',
  templateUrl: './admin-add-testimonials.component.html',
  styleUrls: ['./admin-add-testimonials.component.css']
})
export class AdminAddTestimonialsComponent implements OnInit {

  title = 'Add'
  testimonialsId = ''
  testi_img = ''
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
    const testimonialsId = this.route.snapshot.paramMap.get('testimonialsId');
    this.testimonialsId = testimonialsId;
    this.AddForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      title: ['', [Validators.required]],
      image: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });
    if(this.testimonialsId){
      this.title = 'Edit'
      this.get_data()
    }
  }

  get_data(){
    var data = {testimonialsId:this.testimonialsId};
    this.adminhttp.PostAPI('admin/GetRecordTestimonials', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.testi_img = environment.backend_url +''+ resdata.data.profile;
        this.AddForm = this.formBuilder.group({
          name: [resdata.data.name, [Validators.required]],
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
        this.testi_img = event.target.result;
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
      form_data.append('TestiImg',this.image)
    }
    if(this.testimonialsId){
      form_data.append('testimonialsId',this.testimonialsId)
    }
    this.adminhttp.PostAPI('admin/addTestimonials', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.router.navigate(['admin/testimonials']);
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }


}
