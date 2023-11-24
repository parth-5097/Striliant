import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from "angular-datatables";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {FormBuilder} from "@angular/forms";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx/dist/xlsx.js';
import { ngxCsv } from 'ngx-csv/ngx-csv';

@Component({
  selector: 'app-admin-sellers',
  templateUrl: './admin-sellers.component.html',
  styleUrls: ['./admin-sellers.component.css']
})
export class AdminSellersComponent implements OnInit {

  adminId=''
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  getlist:any[]=[];
  constructor(public router: Router, public toastr: ToastrService, public adminhttp: AdminHttpService, private formBuilder: FormBuilder) {
    if(localStorage.getItem('Admin')){
      let CurrentAdmin = JSON.parse(localStorage.getItem('Admin'));
      this.adminId = CurrentAdmin.adminId;
    }
  }

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
      responsive:true,
      searching:false,
      processing: true,
      order:[[0, 'desc']],
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters['adminId'] =  this.adminId
        this.adminhttp.PostAPI('admin/GetAdmin',dataTablesParameters).then((resdata: any) => {
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
        { data: 'firstname'},
        { data: 'lastname'},
        { data: 'username'},
        { data: 'email'},
        { data: 'mobileno'},
        { data: 'status',orderable:false},
        { data: 'action',orderable:false}
      ]
    }
    setTimeout(() => {
      this.rerender()
    }, 1000)
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

  rerender() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  change_status(adminId) {
    var data = { adminId: adminId }
    this.adminhttp.PostAPI('admin/AdminChangeStatus', data).then((resdata: any) => {
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

  delete_admin(data) {
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
        this.adminhttp.PostAPI('admin/removeAdmin', data).then((resdata: any) => {
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

  export_csv() {
    var data = {adminId:this.adminId};
    this.adminhttp.PostAPI('admin/ExportAdmin',data).then((resdata: any) => {
      if (resdata.status == 200) {
        var options = {
          title: 'Admin Sheet',
          fieldSeparator: ',',
          quoteStrings: '"',
          decimalseparator: '.',
          showLabels: true,
          showTitle: false,
          useBom: true,
          headers: [
            'Id',
            'First Name',
            'Last Name',
            'Username',
            'Email',
            'Mobile No',
            'About',
            'Status',
            'Created Date',
            'Profile'
          ]
        };
        new ngxCsv(resdata.data, 'Admin', options);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
