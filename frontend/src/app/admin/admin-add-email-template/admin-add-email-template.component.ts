import { Component, OnInit, ViewChild } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";

@Component({
  selector: 'app-admin-add-email-template',
  templateUrl: './admin-add-email-template.component.html',
  styleUrls: ['./admin-add-email-template.component.css']
})
export class AdminAddEmailTemplateComponent implements OnInit {

  title = 'Add'
  templateId = ''
  submitted = false;
  AddForm : FormGroup;
  name = 'ng2-ckeditor';
  ckeConfig: any;
  mycontent: string;
  log: string = '';
  @ViewChild("myckeditor") ckeditor: any;
  constructor(public toastr: ToastrService,
              private formBuilder: FormBuilder,
              public adminhttp: AdminHttpService,
              public router: Router,
              private location: Location,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.ckeConfig = {
      allowedContent: false,
      extraPlugins: 'divarea',
      forcePasteAsPlainText: true
    };
    const templateId = this.route.snapshot.paramMap.get('templateId');
    this.templateId = templateId;
    this.AddForm = this.formBuilder.group({
      email_name: ['', [Validators.required]],
      email_subject: ['', [Validators.required]],
      email_content: ['', [Validators.required]],
    });
    if(this.templateId){
      this.title = 'Edit'
      this.get_data()
    }
  }

  get_data(){
    var data = {templateId:this.templateId};
    this.adminhttp.PostAPI('admin/GetRecordTemplate', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.AddForm = this.formBuilder.group({
          email_name: [resdata.data.email_name, [Validators.required]],
          email_subject: [resdata.data.email_subject, [Validators.required]],
          email_content: [resdata.data.email_content, [Validators.required]],
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
    if(this.templateId){
      form_data.append('templateId',this.templateId)
    }
    this.adminhttp.PostAPI('admin/addTemplate', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.router.navigate(['admin/email-templates']);
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
