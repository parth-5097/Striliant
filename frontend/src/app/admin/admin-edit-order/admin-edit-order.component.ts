import {Component, OnInit, ViewChild} from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {FormBuilder, Validators} from "@angular/forms";
import {AdminHttpService} from "../../services/admin-http.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {environment} from "../../../environments/environment";
import {DataTableDirective} from "angular-datatables";
import {Subject} from "rxjs";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-admin-edit-order',
  templateUrl: './admin-edit-order.component.html',
  styleUrls: ['./admin-edit-order.component.css']
})
export class AdminEditOrderComponent implements OnInit {

  adminId = ''
  order_id = ''
  order_number = ''
  order_date = ''
  total_price = ''
  status = ''
  status_name = ''
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  searchlist:any[]=[];
  constructor(public toastr: ToastrService,
              private formBuilder: FormBuilder,
              public adminhttp: AdminHttpService,
              public router: Router,
              private location: Location,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer) {
    if(localStorage.getItem('Admin')){
      let CurrentAdmin = JSON.parse(localStorage.getItem('Admin'));
      this.adminId = CurrentAdmin.adminId;
    }
  }

  ngOnInit(): void {
    const order_id = this.route.snapshot.paramMap.get('order_id');
    this.order_id = order_id;
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
        dataTablesParameters['order_id'] = this.order_id
        this.adminhttp.PostAPI('admin/GetOrderDetails',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.searchlist = resdata.response;
            var OrderDetails = resdata.OrderDetails;
            this.order_number = OrderDetails.order_number
            this.order_date = OrderDetails.created_at
            this.total_price = OrderDetails.total_price
            this.status = OrderDetails.status
            if(OrderDetails.status == 1){
              this.status_name = 'Pending'
            }else if(OrderDetails.status == 2){
              this.status_name = 'Completed'
            }else if(OrderDetails.status == 3){
              this.status_name = 'Cancel'
            }else if(OrderDetails.status == 4){
              this.status_name = 'Deleted'
            }
          } else {
            this.searchlist = [];
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
          this.searchlist = [];
          callback({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
          })
        })
      },
      columns: [
        { data: 'diamond_id',orderable:false,searchable:false},
        { data: 'vendor_id'},
        { data: 'stock_number'},
        { data: 'shape'},
        { data: 'size'},
        { data: 'color'},
        { data: 'cut'},
        { data: 'polish'},
        { data: 'symmetry'},
        { data: 'rap_price'},
        { data: 'vendor_back'},
        { data: 'vendor_price_back'},
        { data: 'vendor_subtotal'},
        { data: 'sale_back'},
        { data: 'sale_price_back'},
        { data: 'sale_subtotal'},
        { data: 'created_at'}
      ]
    }
    setTimeout(() => {
      this.rerender()
    }, 1000)
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
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  photoURL(name) {
    var pattern = /^((http|https|ftp):\/\/)/;
    if(pattern.test(name)) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(name);
    }else{
      return this.sanitizer.bypassSecurityTrustResourceUrl(environment.backend_url+''+name);
    }
  }

  toDataURL(url) {
    return fetch(url)
      .then(response => {
        return response.blob();
      })
      .then(blob => {
        return URL.createObjectURL(blob);
      });
  }

  async download(url) {
    const a = document.createElement("a");
    a.href = await this.toDataURL(url);
    a.download = "download.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  fullURL(name){
    var pattern = /^((http|https|ftp):\/\/)/;
    if(pattern.test(name)) {
      return name;
    }else{
      return environment.backend_url+''+name;
    }
  }

  changestatus(status){
    var data = { order_id: this.order_id, status: status }
    this.adminhttp.PostAPI('admin/OrderChangeStatus', data).then((resdata: any) => {
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

}
