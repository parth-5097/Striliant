import {Component, OnInit, ViewChild} from '@angular/core';
import {environment} from '../../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {HttpService} from '../services/http.service';
import {FormBuilder} from '@angular/forms';
import {DataTableDirective} from 'angular-datatables';
import {HeaderComponent} from '../header/header.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  userId = '';
  email = '';
  @ViewChild(HeaderComponent) Header;
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  searchlistData: any[] = [];
  Pieces = 0;
  Cts;
  Avg_Disc;
  Total_Cr;
  Amount;
  DiamondList = [];
  RemoveList = [];
  AllDiamondList = [];
  isMasterChecked = false;
  cartList = [];

  constructor(private sanitizer: DomSanitizer,
              public router: Router,
              public toastr: ToastrService,
              public http: HttpService,
              private formBuilder: FormBuilder,
              private route: ActivatedRoute) {
    if (localStorage.getItem('User')){
      let CurrentUser = JSON.parse(localStorage.getItem('User'));
      this.userId = CurrentUser.userId;
      this.email = CurrentUser.email;
    }
  }

  ngOnInit(): void {
    this.datatableInit();
  }

  paginate: any =  {
    oPaginate: {
      sPrevious: '<i class="fa fa-angle-left "></i>',
      sFirst: '<i class="fa fa-angle-double-left"></i>',
      sNext: '<i class="fa fa-angle-right"></i>',
      sLast: '<i class="fa fa-angle-double-right"></i>',
    }
  };

  datatableInit(){
    this.searchlistData = [];
    this.Pieces = 0;
    this.Cts = 0;
    this.Avg_Disc = 0;
    this.Total_Cr = 0;
    this.Amount = 0;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.paginate,
      serverSide: true,
      responsive: false,
      searching: false,
      processing: true,
      order: [[0, 'desc']],
      scrollX: true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.userId = this.userId;
        this.http.PostAPI('users/GetCartData', dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.AllDiamondList = [];
            this.searchlistData = resdata.data;
            for (var i = 0; i < this.searchlistData.length; i++) {
              var diamond_id = parseInt(this.searchlistData[i].diamond_id);
              if (!this.AllDiamondList.includes(diamond_id)) {
                this.AllDiamondList.push(diamond_id);
              }
            }
            let isFounded = this.AllDiamondList.every( ai => this.RemoveList.includes(ai) );
            if (isFounded == true){
              this.isMasterChecked = true;
            }else{
              this.isMasterChecked = false;
            }
            this.DiamondList = resdata.DiamondList;
            this.Pieces = resdata.TotalRecords.cnt;
            var sale_back = 0;
            var sale_w_back = 0;
            var old_cts = 0;
            var Avg_Disc_temp = 0;
            for (var i = 0; i < this.searchlistData.length; i++) {
              old_cts = old_cts + this.searchlistData[i].size;
              sale_back = sale_back + parseFloat(this.searchlistData[i].sale_back);
              sale_w_back = sale_w_back + parseFloat(this.searchlistData[i].sale_price_back);
            }
            this.Cts = (old_cts).toFixed(2);
            Avg_Disc_temp = sale_back / this.Pieces;
            this.Avg_Disc = (Avg_Disc_temp).toFixed(2);
            this.Total_Cr = sale_w_back / this.Pieces;
            this.Amount = this.Total_Cr * old_cts;
          } else {
            this.searchlistData = [];
            this.DiamondList = [];
            this.Cts = 0;
            this.Pieces = 0;
            this.Avg_Disc = 0;
            this.Total_Cr = 0;
            this.Amount = 0;
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
          this.searchlistData = [];
          callback({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
          });
        });
      },
      columns: [
        { data: 'diamond_id', orderable: false, searchable: false},
        { data: 'action', orderable: false, searchable: false},
        { data: 'diamond_id', orderable: false, searchable: false},
        { data: 'stock_number'},
        { data: 'shape'},
        { data: 'size'},
        { data: 'color'},
        { data: 'cut'},
        { data: 'polish'},
        { data: 'symmetry'},
        { data: 'sale_back'},
        { data: 'sale_price_back'},
        { data: 'sale_subtotal'},
        { data: 'created_at'}
      ]
    };
    setTimeout(() => {
      this.rerender();
    }, 1500);
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
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  photoURL(name){
    var pattern = /^((http|https|ftp):\/\/)/;
    if (pattern.test(name)) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(name);
    }else{
      return this.sanitizer.bypassSecurityTrustResourceUrl(environment.backend_url + '' + name);
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

  fullURL(name){
    var pattern = /^((http|https|ftp):\/\/)/;
    if (pattern.test(name)) {
      return name;
    }else{
      return environment.backend_url + '' + name;
    }
  }

  async download(url) {
    const a = document.createElement('a');
    a.href = await this.toDataURL(url);
    a.download = 'download.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  removeItem(diamond_id) {
    if (!this.RemoveList.includes(diamond_id)) {
      this.RemoveList.push(diamond_id);
    }
    var data = { userId: this.userId, RemoveList: this.RemoveList }
    this.http.PostAPI('users/RemoveCart', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.Header.cartItem();
        this.toastr.success(resdata.message);
        this.ReloadDatatable();
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  checkuncheckall() {
    if (this.isMasterChecked == false){
      this.isMasterChecked = true;
      for(var i = 0; i < this.searchlistData.length; i++){
        var diamond_id = parseInt(this.searchlistData[i].diamond_id)
        if (!this.RemoveList.includes(diamond_id)) {
          this.RemoveList.push(diamond_id);
        }else{
          // const index: number = this.RemoveList.indexOf(diamond_id);
          // if (index !== -1) {
          //   this.RemoveList.splice(index, 1);
          // }
        }
      }
    }else{
      this.isMasterChecked = false;
      this.RemoveList = [];
    }
    // console.log(this.RemoveList)
  }

  checkboxSelect(diamond){
    var diamond_id = parseInt(diamond);
    if (!this.RemoveList.includes(diamond_id)) {
      this.RemoveList.push(diamond_id);
    }else{
      const index1: number = this.RemoveList.indexOf(diamond_id);
      if (index1 !== -1) {
        this.RemoveList.splice(index1, 1);
      }
    }
    // console.log(this.RemoveList)
  }

  SelectRemoveItem(){
    var data = { userId: this.userId, RemoveList: this.RemoveList }
    this.http.PostAPI('users/RemoveCart', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.Header.cartItem()
        this.toastr.success(resdata.message);
        this.isMasterChecked = false;
        this.RemoveList = [];
        this.ReloadDatatable();
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  placeOrder(){
    var diamondList = this.RemoveList;
    /*var data = {
      userId:this.userId,
      diamond_id: diamondList,
      email:this.email,
      pieces:this.Pieces,
      cts:this.Cts,
      avg_disc:this.Avg_Disc,
      total_cr:this.Total_Cr.toFixed(2),
      total_price:this.Amount.toFixed(2)
    }*/
    var data = {
      userId: this.userId,
      diamond_id: diamondList,
      email: this.email
    };
    this.http.PostAPI('users/PlaceOrder', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.Header.cartItem();
        this.ReloadDatatable();
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
