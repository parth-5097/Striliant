import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {HttpService} from "../services/http.service";
import {FormBuilder} from "@angular/forms";
import {DataTableDirective} from "angular-datatables";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import {ngxCsv} from "ngx-csv";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  userId = ''
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  orderList:any[]=[];
  tab_status = 0
  constructor(public router: Router, public toastr: ToastrService, public http: HttpService, private formBuilder: FormBuilder) {
    if(localStorage.getItem('User')){
      let CurrentUser = JSON.parse(localStorage.getItem('User'));
      this.userId = CurrentUser.userId;
    }
  }

  ngOnInit(): void {
    this.datatableInit()
  }

  paginate: any =  {
    oPaginate: {
      sPrevious: '<i class="fa fa-angle-left "></i>',
      sFirst: '<i class="fa fa-angle-double-left"></i>',
      sNext: '<i class="fa fa-angle-right"></i>',
      sLast: '<i class="fa fa-angle-double-right"></i>',
    }
  };

  openorderstatus(tab_status){
    this.tab_status = tab_status;
    this.filterById();
    this.rerender();
  }

  datatableInit(){
    this.dtOptions = {
      pagingType: 'first_last_numbers',
      pageLength: 10,
      language: this.paginate,
      serverSide: true,
      responsive: false,
      searching: false,
      processing: true,
      order: [[0, 'desc']],
      scrollX: true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.status = this.tab_status;
        dataTablesParameters.userId = this.userId;
        this.http.PostAPI('users/searchOrders', dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.orderList = resdata.response;
          } else {
            this.orderList = [];
            resdata.TotalRecords.cnt = 0;
          }
          callback({
            recordsTotal: resdata.TotalRecords.cnt,
            recordsFiltered: resdata.TotalRecords.cnt,
            data: []
          });
        }).catch((err) => {
          if (err.error == 'Unauthorized') {
            this.http.logout();
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
        { data: 'order_id'},
        { data: 'created_at'},
        { data: 'status'},
        { data: 'pieces'},
        { data: 'cts'},
        { data: 'avg_disc'},
        { data: 'total_cr'},
        { data: 'total_price'},
        { data: 'action', orderable: false}
      ]
    }
    setTimeout(() => {
      this.rerender()
    }, 1500)
  }

  timer: any = '';
  filterById() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.ReloadDatatable();
    }, 500);
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
      title: '',
      text: '',
      type: 'warning',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.value) {
        this.http.PostAPI('users/removeOrder', data).then((resdata: any) => {
          if (resdata.status == 200) {
            this.toastr.success(resdata.message);
            this.ReloadDatatable();
          } else {
            this.toastr.error(resdata.message);
          }
        }).catch((err) => {
          return err;
        });
      }
      return result;
    });
  }

  export_csv() {
    var data = {userId:this.userId};
    this.http.PostAPI('users/ExportOrders',data).then((resdata: any) => {
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

  copyHtml(item){
    let html = '';
    html += `Order # : ${item.order_id}`;
    html += `, Pieces : ${item.pieces}`;
    html += `, Cts : ${item.cts}`;
    html += `, Avg Disc : ${item.avg_disc}%`;
    html += `, Total Cr : $${item.total_cr}`;
    html += `, Amount : $${item.total_price}`;
    return html;
  }

  chatMessage(){
    this.router.navigate(['message']);
  }

}
