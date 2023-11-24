import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from "angular-datatables";
import {Subject} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {HttpService} from "../services/http.service";
import {FormBuilder} from "@angular/forms";
import {environment} from "../../environments/environment";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {

  userId = ''
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
  pieces = 0
  cts = 0
  avg_disc = 0
  total_cr = 0
  constructor(public router: Router, public toastr: ToastrService, public http: HttpService, private formBuilder: FormBuilder,private route: ActivatedRoute, private sanitizer: DomSanitizer) {
    if(localStorage.getItem('User')){
      let CurrentUser = JSON.parse(localStorage.getItem('User'));
      this.userId = CurrentUser.userId;
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
        this.http.PostAPI('users/GetOrderDetails',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.searchlist = resdata.response;
            var OrderDetails = resdata.OrderDetails;
            this.order_number = OrderDetails.order_number
            this.order_date = OrderDetails.created_at
            this.pieces = OrderDetails.pieces
            this.cts = OrderDetails.cts
            this.avg_disc = OrderDetails.avg_disc
            this.total_cr = OrderDetails.total_cr
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
          }
          callback({
            recordsTotal: resdata.TotalRecords['cnt'],
            recordsFiltered: resdata.TotalRecords['cnt'],
            data: []
          })
        }).catch((err) => {
          if (err.error == 'Unauthorized') {
            this.http.logout();
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
    // this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //   window.dispatchEvent(new Event('resize'));
    // });
    window.dispatchEvent(new Event('resize'));
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

}
