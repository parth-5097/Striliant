import {Component, OnInit, ViewChild} from '@angular/core';
import {DataTableDirective} from "angular-datatables";
import {Subject} from "rxjs";
import {DomSanitizer} from "@angular/platform-browser";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {FormBuilder} from "@angular/forms";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-admin-cart-list',
  templateUrl: './admin-cart-list.component.html',
  styleUrls: ['./admin-cart-list.component.css']
})
export class AdminCartListComponent implements OnInit {

  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  searchlist:any[]=[];
  adminId = ''
  cartId = ''
  Pieces = 0
  Cts;
  Avg_Disc;
  Total_Cr;
  Amount;
  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer,public router: Router, public toastr: ToastrService, public adminhttp: AdminHttpService, private formBuilder: FormBuilder) {
    if(localStorage.getItem('Admin')){
      let CurrentAdmin = JSON.parse(localStorage.getItem('Admin'));
      this.adminId = CurrentAdmin.adminId;
    }
  }

  ngOnInit(): void {
    const cartId = this.route.snapshot.paramMap.get('cartId');
    this.cartId = cartId;
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
    this.searchlist=[]
    this.Pieces = 0
    this.Cts = 0
    this.Avg_Disc = 0
    this.Total_Cr = 0
    this.Amount = 0
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.paginate,
      serverSide: true,
      responsive:false,
      searching:false,
      processing: true,
      order:[[5, 'desc']],
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters['cartId'] = this.cartId
        this.adminhttp.PostAPI('admin/GetCartData',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.searchlist = resdata.data;
            this.Pieces = resdata.TotalRecords['cnt']
            var sale_back = 0
            var sale_w_back = 0
            var old_cts = 0
            var Avg_Disc_temp = 0
            for (var i = 0; i < this.searchlist.length; i++) {
              old_cts = old_cts + this.searchlist[i].size
              sale_back = sale_back + parseFloat(this.searchlist[i].sale_back);
              sale_w_back = sale_w_back + parseFloat(this.searchlist[i].sale_price_back);
            }
            this.Cts = (old_cts).toFixed(2)
            Avg_Disc_temp = sale_back/this.Pieces
            this.Avg_Disc = (Avg_Disc_temp).toFixed(2)
            this.Total_Cr = sale_w_back/this.Pieces
            this.Amount = this.Total_Cr*old_cts
          } else {
            this.searchlist = [];
            this.Cts = 0
            this.Pieces = 0
            this.Avg_Disc = 0
            this.Total_Cr = 0
            this.Amount = 0
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

}
