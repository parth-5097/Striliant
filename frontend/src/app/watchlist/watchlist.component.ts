import {Component, OnInit, ViewChild} from '@angular/core';
import {ngxCsv} from "ngx-csv";
import {DataTableDirective} from "angular-datatables";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {HttpService} from "../services/http.service";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import {HeaderComponent} from "../header/header.component";

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.css']
})
export class WatchlistComponent implements OnInit {

  userId = ''
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  watchList:any[]=[];
  tab_status = 0
  cartId = ''
  DiamondList:any = []
  isMasterChecked = false;
  isChecked = false;
  watchlistList:any = []
  searchlistData:any[]=[];
  AllDiamondList = []
  // @ts-ignore
  @ViewChild(HeaderComponent) Header;
  constructor(public router: Router, public toastr: ToastrService, public http: HttpService) {
    if(localStorage.getItem('User')){
      let CurrentUser = JSON.parse(localStorage.getItem('User'));
      this.userId = CurrentUser.userId;
    }
  }

  ngOnInit(): void {
    this.cartItem()
    this.datatableInit()
  }


  getwatchlistlist() {
    this.watchlistList = [];
    for (var i in this.watchList) {
      this.watchlistList.push(this.watchList[i]['diamond_id'])
    }
    return this.watchlistList
  }

  export_csv() {
    var diamondList = this.getwatchlistlist()
    var data = {DiamondList : diamondList};
    this.http.PostAPI('users/ExportWatchList',data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.isMasterChecked = false
        this.DiamondList = []
        let options = {
          title: 'Diamonds Sheet',
          fieldSeparator: ',',
          quoteStrings: '"',
          decimalseparator: '.',
          showLabels: true,
          showTitle: false,
          useBom: true,
          headers: [
            'ID',
            'Type',
            'Stock Number',
            'Sale Back',
            'Sale Price W Back',
            'Sale Subtotal',
            'Availability',
            'Country',
            'State',
            'City',
            'Shape',
            'Size',
            'Color',
            'Clarity',
            'Cut',
            'Polish',
            'Symmetry',
            'Fluorescence Intensity',
            'Fluorescence Color',
            'Measurements Length',
            'Measurements Width',
            'Measurements Depth',
            'Depth Percentage',
            'Table Percentage',
            'Crown Angle',
            'Crown Height',
            'Pavilion Angle',
            'Pavilion Depth',
            'Girdle Depth',
            'Girdle Min',
            'Girdle Max',
            'Girdle Percentage',
            'Culet Condition',
            'Culet Size',
            'Treatment',
            'Laser Inscription Angle',
            'Star Length',
            'Lab',
            'Report Number',
            'Report Date',
            'Lab Location',
            'Report Comment',
            'Key to Symbols',
            'Fancy Color Intensity',
            'Fancy Color Overtones',
            'Fancy Dominant Color',
            'Fancy Secondary Color',
            'Sarine Loupe',
            'Seller Spec',
            'Shade',
            'Milky',
            'Eye Clean',
            'Open Inclusions',
            'Black Inclusions',
            'White Inclusions',
            'Brands',
            'Report File',
            'Diamond Image',
            'Video Link',
            'Status',
            'Created Date',
            'Updated Date',
          ]
        };
        new ngxCsv(resdata.data, 'Watchlist', options);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
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
        dataTablesParameters['status'] = 1
        dataTablesParameters['userId'] = this.userId
        this.http.PostAPI('users/searchWatchlist',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.watchList = resdata.data;
            this.AllDiamondList = []
            for(var i=0;i<this.watchList.length;i++) {
              var diamond_id = parseInt(this.watchList[i].diamond_id)
              if (!this.AllDiamondList.includes(diamond_id)) {
                this.AllDiamondList.push(diamond_id);
              }
            }
            let isFounded = this.AllDiamondList.every( ai => this.DiamondList.includes(ai) );
            if(isFounded == true){
              this.isMasterChecked = true
            }else{
              this.isMasterChecked = false
            }

          } else {
            this.watchList = [];
            resdata.TotalRecords['cnt'] = 0
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
          this.watchList = [];
          callback({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
          })
        })
      },
      columns: [
        { data: 'diamond_id', orderable:false, searchable:false},
        { data: 'stock_number'},
        { data: 'lab'},
        { data: 'rap_price'},
        { data: 'size'},
        { data: 'sale_back'},
        { data: 'sale_price_back'},
        { data: 'sale_subtotal'},
        { data: 'action', orderable:false}
      ]
    }
    setTimeout(() => {
      this.rerender();
    }, 1500)
  }

  rerender() {
    window.dispatchEvent(new Event('resize'));
  }

  ReloadDatatable() {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.ajax.reload();
    });
  }

  delete_order(data){
    var dataset = {
      userId:this.userId,
      diamond_id: data,
    }
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
        this.http.PostAPI('users/removeWatchList', dataset).then((resdata: any) => {
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

  copyHtml(item){
    let html = ''
    html += `Stock Number # : ${item.stock_number}`;
    html += `, Lab : ${item.lab}`;
    html += `, Rapnet Prise : $${item.rap_price}`;
    html += `, Cts : ${item.size} Cts`;
    html += `, Avg Disc : ${item.sale_back}%`;
    html += `, Total Pr/Ct : $${item.sale_price_back}`;
    html += `, Total Amount : $${item.sale_subtotal}`;
    return html;
  }

  chatMessage(){
    this.router.navigate(['message']);
  }

  checkuncheckall() {
    if(this.isMasterChecked == false){
      this.isMasterChecked = true
      for(var i = 0; i < this.watchList.length; i++){
        var diamond_id = parseInt(this.watchList[i].diamond_id)
        if (!this.DiamondList.includes(diamond_id)) {
          this.DiamondList.push(diamond_id);
        }else{
          // const index: number = this.DiamondList.indexOf(diamond_id);
          // if (index !== -1) {
          //   this.DiamondList.splice(index, 1);
          // }
        }
      }
    }else{
      this.isMasterChecked = false
      this.DiamondList = []
    }
  }

  checkboxSelect(diamond){
    console.log('diamond:::::'+ JSON.stringify(diamond))         //diamond:::::"204"
    var diamond_id = parseInt(diamond)
    if (!this.DiamondList.includes(diamond_id)) {
      this.DiamondList.push(diamond_id);
    }else{
      const index1: number = this.DiamondList.indexOf(diamond_id);
      if (index1 != -1) {
        this.DiamondList.splice(index1, 1);
      }
    }
  }

  ParticularAddToCart(diamond){
    var diamond_id = parseInt(diamond)
    if (!this.DiamondList.includes(diamond_id)) {
      this.DiamondList.push(diamond_id);
    }else{
      const index1: number = this.DiamondList.indexOf(diamond_id);
      if (index1 !== -1) {
        this.DiamondList.splice(index1, 1);
      }
    }
    this.AddToCart()
  }


  cartItem(){
    var data = {userId:this.userId}
    this.http.PostAPI('users/GetCartItem', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.DiamondList = resdata.data
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  AddToCart(){
    if(this.DiamondList.length>0){
      var data = { cartId:this.cartId, userId:this.userId, diamondList: this.DiamondList }
      this.http.PostAPI('users/AddToCart', data).then((resdata: any) => {
        if (resdata.status == 200) {
          this.Header.cartItem()
          this.cartId = resdata.cartId
          this.toastr.success(resdata.message);
        } else {
          this.toastr.error(resdata.message)
        }
      }).catch((err) => {
        this.toastr.error(err);
      });
    }else{
      this.toastr.error('Please select any diamond');
    }
  }
}
