import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-admin-add-brands',
  templateUrl: './admin-add-brands.component.html',
  styleUrls: ['./admin-add-brands.component.css']
})
export class AdminAddBrandsComponent implements OnInit {

  title = 'Add'
  brandId = ''
  brand_img = ''
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
    const brandId = this.route.snapshot.paramMap.get('brandId');
    this.brandId = brandId;
    this.AddForm = this.formBuilder.group({
      title: ['', [Validators.required]],
      image: ['', [Validators.required]],
    });
    if(this.brandId){
      this.title = 'Edit'
      this.get_data()
    }
  }

  get_data(){
    var data = {brandId:this.brandId};
    this.adminhttp.PostAPI('admin/GetRecordBrands', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.brand_img = environment.backend_url +''+ resdata.data.profile;
        this.AddForm = this.formBuilder.group({
          title: [resdata.data.title, [Validators.required]],
          image: ['']
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
        this.brand_img = event.target.result;
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
      form_data.append('BrandImg',this.image)
    }
    if(this.brandId){
      form_data.append('brandId',this.brandId)
    }
    this.adminhttp.PostAPI('admin/addBrands', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.router.navigate(['admin/brands']);
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
