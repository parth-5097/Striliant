import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from "angular-datatables";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {FormBuilder} from "@angular/forms";
import {environment} from "../../../environments/environment";
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-admin-email-templates',
  templateUrl: './admin-email-templates.component.html',
  styleUrls: ['./admin-email-templates.component.css']
})
export class AdminEmailTemplatesComponent implements OnInit {

  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  getlist:any[]=[];
  environment = environment.backend_url
  constructor(public router: Router, public toastr: ToastrService, public adminhttp: AdminHttpService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.datatableInit()
  }

  paginate:any =  {
    oPaginate: {
      sPrevious: '<i class="fa fa-angle-left "></i>',
      sFirst: '<i class="fa fa-angle-double-left"></i>',
      sNext: '<i class="fa fa-angle-right"></i>',
      sLast: '<i class="fa fa-angle-double-right"></i>',
    }
  }

  datatableInit(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.paginate,
      serverSide: true,
      responsive:false,
      searching:false,
      processing: true,
      order:[[0, 'desc']],
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        this.adminhttp.PostAPI('admin/GetTemplates',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.getlist = resdata.response;
          } else {
            this.getlist = [];
          }
          callback({
            recordsTotal: resdata.TotalRecords['cnt'],
            recordsFiltered: resdata.TotalRecords['cnt'],
            data: []
          })
        }).catch((err) => {
          if (err.error == 'Unauthorized') {
            this.adminhttp.logout();
          }
          this.getlist = [];
          callback({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
          })
        })
      },
      columns: [
        { data: 'email_name'},
        { data: 'email_subject'},
        { data: 'email_content'},
        { data: 'created_at'},
        { data: 'action',orderable:false}
      ]
    }
    setTimeout(() => {
      this.rerender()
    }, 1500)
  }

  rerender() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  timer: any = "";
  filterById(e:any) {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.ReloadDatatable()
    }, 500)
  }

  ReloadDatatable() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

}
