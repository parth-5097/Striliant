import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from "angular-datatables";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {FormBuilder} from "@angular/forms";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import {ngxCsv} from "ngx-csv";

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {

  adminId=''
  isMasterChecked = false;
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  orderList:any[]=[];
  OrderList = [];
  tab_status = 0
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

  openorderstatus(tab_status){
    this.tab_status = tab_status
    this.filterById()
    this.rerender()
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
        dataTablesParameters['status'] = this.tab_status
        this.adminhttp.PostAPI('admin/searchOrders',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.orderList = resdata.response;
          } else {
            this.orderList = [];
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
          this.orderList = [];
          callback({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
          })
        })
      },
      columns: [
        { data: 'order_id', orderable:false, searchable:false},
        { data: 'order_id'},
        { data: 'created_at'},
        { data: 'status'},
        { data: 'pieces'},
        { data: 'cts'},
        { data: 'avg_disc'},
        { data: 'total_cr'},
        { data: 'total_price'},
        { data: 'action',orderable:false}
      ]
    }
    setTimeout(() => {
      this.rerender()
    }, 1500)
  }

  timer: any = "";
  filterById() {
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
    window.dispatchEvent(new Event('resize'));
  }

  delete_order(data){
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
        this.adminhttp.PostAPI('admin/removeOrder', data).then((resdata: any) => {
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
    this.adminhttp.PostAPI('admin/ExportOrders',data).then((resdata: any) => {
      if (resdata.status == 200) {
        var options = {
          title: 'Orders Sheet',
          fieldSeparator: ',',
          quoteStrings: '"',
          decimalseparator: '.',
          showLabels: true,
          showTitle: false,
          useBom: true,
          headers: [
            'ID',
            'Item',
            'Price',
            'Cts',
            'Avg Disc',
            'Total CT/Pr',
            'Total Amount',
            'Status',
            'Created Date',
            'Updated Date',
          ]
        };
        new ngxCsv(resdata.data, 'Orders', options);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  checkuncheckall() {
    if(this.isMasterChecked == false){
      this.isMasterChecked = true
      for(var i=0;i<this.orderList.length;i++){
        var diamond_id = parseInt(this.orderList[i].order_id)
        if (!this.OrderList.includes(diamond_id)) {
          this.OrderList.push(diamond_id);
        }else{
          // const index: number = this.DiamondList.indexOf(diamond_id);
          // if (index !== -1) {
          //   this.DiamondList.splice(index, 1);
          // }
        }
      }
    }else{
      this.isMasterChecked = false
      this.OrderList = []
    }
  }

  checkboxSelect(orderId){
    var order_id = parseInt(orderId)
    if (!this.OrderList.includes(order_id)) {
      this.OrderList.push(order_id);
    }else{
      const index1: number = this.OrderList.indexOf(order_id);
      if (index1 != -1) {
        this.OrderList.splice(index1, 1);
      }
    }
  }

  multi_delete(){
    var data = {
      OrderList: this.OrderList
    };
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
        this.adminhttp.PostAPI('admin/multiRemoveOrder', data).then((resdata: any) => {
          if (resdata.status == 200) {
            this.toastr.success(resdata.message);
            this.isMasterChecked = false
            this.ReloadDatatable()
            this.OrderList = []
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
