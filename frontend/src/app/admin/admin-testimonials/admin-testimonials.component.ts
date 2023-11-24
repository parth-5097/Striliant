import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from "angular-datatables";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {FormBuilder} from "@angular/forms";
import {environment} from "../../../environments/environment";
import Swal from 'sweetalert2/dist/sweetalert2.js';

@Component({
  selector: 'app-admin-testimonials',
  templateUrl: './admin-testimonials.component.html',
  styleUrls: ['./admin-testimonials.component.css']
})
export class AdminTestimonialsComponent implements OnInit {

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
      order:[[1, 'desc']],
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        this.adminhttp.PostAPI('admin/GetTestimonials',dataTablesParameters).then((resdata: any) => {
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
        { data: 'profile',orderable:false,searchable:false},
        { data: 'name'},
        { data: 'title'},
        { data: 'description'},
        { data: 'created_at'},
        { data: 'status',orderable:false},
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

  change_status(testimonialsId) {
    var data = { testimonialsId: testimonialsId }
    this.adminhttp.PostAPI('admin/TestimonialsChangeStatus', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.ReloadDatatable()
      } else {
        this.toastr.error(resdata.message)
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  delete_testimonials(data) {
    Swal.fire({
      title: "",
      text: "",
      type: 'warning',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.value) {
        this.adminhttp.PostAPI('admin/removeTestimonials', data).then((resdata: any) => {
          if (resdata.status == 200) {
            this.toastr.success(resdata.message);
            this.ReloadDatatable()
          } else {
            this.toastr.error(resdata.message)
          }
        }).catch((err) => {
          return err;
        });
      }
      return result;
    });
  }

}
