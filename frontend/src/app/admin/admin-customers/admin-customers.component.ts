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
  selector: 'app-admin-customers',
  templateUrl: './admin-customers.component.html',
  styleUrls: ['./admin-customers.component.css']
})
export class AdminCustomersComponent implements OnInit {

  adminId=''
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtOptions1: DataTables.Settings = {};
  dtOptions2: DataTables.Settings = {};
  getlist:any[]=[];
  subscribersgetlist:any[]=[];
  checkoutlist:any[]=[];
  AdminData = ''
  step:number = 1
  constructor(public router: Router, public toastr: ToastrService, public adminhttp: AdminHttpService, private formBuilder: FormBuilder) {
    if(localStorage.getItem('Admin')){
      let CurrentAdmin = JSON.parse(localStorage.getItem('Admin'));
      this.adminId = CurrentAdmin.adminId;
    }
  }

  ngOnInit(): void {
    this.datatableInit()
    this.AbandobneddatatableInit()
    this.subscribersdatatableInit()
  }

  check_step(step){
    this.step = step
    if(this.step == 1){
      setTimeout(() => {
        this.rerender()
      }, 500)
    }
    if(this.step == 2){
      setTimeout(() => {
        this.rerender2()
      }, 500)
    }
    if(this.step == 3){
      setTimeout(() => {
        this.rerender1()
      }, 500)
    }
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
      serverSide:true,
      responsive:true,
      searching:false,
      processing: true,
      order:[[2, 'desc']],
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters['adminId'] =  this.adminId
        this.adminhttp.PostAPI('admin/GetUsers',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.getlist = resdata.response;
            this.AdminData = resdata.AdminData;
          } else {
            this.getlist = [];
            resdata.TotalRecords['cnt'] = 0
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
        { data: 'action',orderable:false},
        { data: 'status',orderable:false},
        { data: 'firstname'},
        { data: 'lastname'},
        { data: 'username'},
        { data: 'mobile'},
        { data: 'email'},
        { data: 'address'},
        { data: 'company_name'},
        { data: 'designation'},
        { data: 'business_type'},
        { data: 'adminId'}
      ]
    }
    setTimeout(() => {
      this.rerender()
    }, 1500)
  }

  timer: any = "";
  filterById(e:any) {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.ReloadDatatable()
    }, 500)
  }

  ReloadDatatable() {
    $('.customers-list').DataTable().ajax.reload();
  }

  rerender() {
    //this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      window.dispatchEvent(new Event('resize'));
    //});
  }

  subscribersdatatableInit(){
    this.dtOptions1 = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.paginate,
      serverSide: true,
      responsive: true,
      searching: false,
      processing: true,
      order:[[0, 'desc']],
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters['adminId'] =  this.adminId
        this.adminhttp.PostAPI('admin/GetSubscribers',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.subscribersgetlist = resdata.response;
          } else {
            this.subscribersgetlist = [];
            resdata.TotalRecords['cnt'] = 0
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
          this.subscribersgetlist = [];
          callback({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
          })
        })
      },
      columns: [
        { data: 'subscriber_email'},
        { data: 'created_at'},
        { data: 'action',orderable:false}
      ]
    }
    setTimeout(() => {
      this.rerender1()
    }, 1500)
  }

  timer1:any="";
  filterById1() {
    clearTimeout(this.timer1)
    this.timer1=setTimeout(()=>{
      this.ReloadDatatable1()
    },500)
  }

  ReloadDatatable1(){
    $('.subscribers-list').DataTable().ajax.reload();
  }

  rerender1(){
    //this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      window.dispatchEvent(new Event('resize'));
    //});
  }

  AbandobneddatatableInit(){
    this.dtOptions2 = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.paginate,
      serverSide: true,
      responsive: true,
      searching: false,
      processing: true,
      order:[[0, 'desc']],
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters['adminId'] =  this.adminId
        this.adminhttp.PostAPI('admin/GetAbandonedCheckout',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.checkoutlist = resdata.response;
          } else {
            this.checkoutlist = [];
            resdata.TotalRecords['cnt'] = 0
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
          this.checkoutlist = [];
          callback({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
          })
        })
      },
      columns: [
        { data: 'cartId'},
        { data: 'total',searchable:false,orderable:false},
      ]
    }
    setTimeout(() => {
      this.rerender2()
    }, 1500)
  }

  timer2:any="";
  filterById2() {
    clearTimeout(this.timer2)
    this.timer2=setTimeout(()=>{
      this.ReloadDatatable2()
    },500)
  }

  ReloadDatatable2(){
    $('.abandonedcheckout-list').DataTable().ajax.reload();
  }

  rerender2(){
    //this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
    window.dispatchEvent(new Event('resize'));
    //});
  }

  delete_subscriber(data) {
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
        this.adminhttp.PostAPI('admin/removeSubscriber', data).then((resdata: any) => {
          if (resdata.status == 200) {
            this.toastr.success(resdata.message);
            this.ReloadDatatable1()
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

  change_status(userId) {
    var data = { userId: userId }
    this.adminhttp.PostAPI('admin/UserChangeStatus', data).then((resdata: any) => {
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

  delete_customer(data) {
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
        this.adminhttp.PostAPI('admin/removeUser', data).then((resdata: any) => {
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
    var data = {};
    this.adminhttp.PostAPI('admin/ExportUser',data).then((resdata: any) => {
      if (resdata.status == 200) {
        var options = {
          title: 'Customer Sheet',
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
            'Company Name',
            'Designation',
            'Business Type',
            'Country',
            'State',
            'City',
            'Zip Code',
            'Address',
            'Notes',
            'Tags',
            'Status',
            'Created Date'
          ]
        };
        new ngxCsv(resdata.data, 'Customer', options);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  select_manager(adminId,userId){
    var data = {userId:userId, adminId:adminId}
    this.adminhttp.PostAPI('admin/assignManager', data).then((resdata: any) => {
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

  chat_customer(userId){
    this.router.navigate(['/admin/message',userId]);
  }

}
