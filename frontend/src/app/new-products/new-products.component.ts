import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from "../services/http.service";
import {DomSanitizer} from "@angular/platform-browser";
import {Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {HeaderComponent} from "../header/header.component";
import {ngxCsv} from "ngx-csv";
import {environment} from "../../environments/environment";
import {DataTableDirective} from "angular-datatables";

@Component({
  selector: 'app-new-products',
  templateUrl: './new-products.component.html',
  styleUrls: ['./new-products.component.css']
})
export class NewProductsComponent implements OnInit {

  @ViewChild(HeaderComponent) Header;
  searching_div = true
  Search_saved = ''
  search_saved_id = ''
  searchlistData:any[]=[];
  DiamondList = []
  cartId = ''
  userId = ''
  dtOptions: DataTables.Settings = {};
  isMasterChecked = false;
  watchListId = ''
  email = ''
  Pieces = 0
  Cts;
  Avg_Disc;
  Total_Cr;
  Amount;
  AllDiamondList = []
  datatableElement: DataTableDirective;
  search_data:{}={
    shape_basic:'',
    shape_advanced:[],
    size_general_from:'',
    size_general_to:'',
    size_specific:[],
    color_fancy:[],
    color_white_intensity_from:'',
    color_white_intensity_to:'',
    color_white_overtone:'',
    color_white_color:'',
    clarity:[],
    finish_general_cut_from:'',
    finish_general_cut_to:'',
    finish_general_polish_from:'',
    finish_general_polish_to:'',
    finish_general_symmetry_from:'',
    finish_general_symmetry_to:'',
    finish_specific:[],
    fluorescence_intensity:[],
    grading_report:[],
    location:[],
    flexible_delivery:'',
    company_code:'',
    rating:'',
    stock_number:'',
    lot_number:'',
    specification:[],
    price_ct_from:'',
    price_ct_to:'',
    price_total_from:'',
    price_total_to:'',
    price_rap_from:'',
    price_rap_to:'',
    show_only:[],
    my_notes:[],
    media:[],
    per_depth_from:'',
    per_depth_to:'',
    per_table_from:'',
    per_table_to:'',
    metric_length_from:'',
    metric_length_to:'',
    metric_width_from:'',
    metric_width_to:'',
    metric_depth_from:'',
    metric_depth_to:'',
    ratio_from:'',
    ratio_to:'',
    preset_ratio:'',
    crown_height_from:'',
    crown_height_to:'',
    crown_angle_from:'',
    crown_angle_to:'',
    pavilion_depth_from:'',
    pavilion_depth_to:'',
    pavilion_angle_from:'',
    pavilion_angle_to:'',
    girdle:[],
    culet_size:[],
    culet_condition:[],
    treatment:'no-treatment',
    symbols:'contains',
    brands:[],
    category_code:'',
    lab_report_number:'',
    access_code:'',
    symbol_checkbox:[]
  };

  constructor(private sanitizer: DomSanitizer, public router: Router, public toastr: ToastrService, public http: HttpService) {
    if(localStorage.getItem('User')){
      let CurrentUser = JSON.parse(localStorage.getItem('User'));
      this.userId = CurrentUser.userId;
      this.email = CurrentUser.email;
    }
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

  AddToWatchlist(){
    if(this.DiamondList.length>0){
      var data = { watchListId:this.watchListId, userId:this.userId, diamondList: this.DiamondList }
      this.http.PostAPI('users/AddToWatchList', data).then((resdata: any) => {
        if (resdata.status == 200) {
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

  export_csv() {
    var data = {DiamondList : this.DiamondList};
    this.http.PostAPI('users/ExportDiamonds',data).then((resdata: any) => {
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
        new ngxCsv(resdata.data, 'Diamonds', options);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  checkuncheckall()
  {
    if(this.isMasterChecked == false){
      this.isMasterChecked = true
      for(var i=0;i<this.searchlistData.length;i++){
        var diamond_id = parseInt(this.searchlistData[i].diamond_id)
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
    var diamond_id = parseInt(diamond)
    if (!this.DiamondList.includes(diamond_id)) {
      this.DiamondList.push(diamond_id);
    }else{
      const index1: number = this.DiamondList.indexOf(diamond_id);
      if (index1 !== -1) {
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

  copyHtml(item){
    let html = ''
    html += `Stock # : ${item.stock_number}`;
    html += `, Shape : ${item.shape}`;
    html += `, Size : ${item.size}`;
    html += `, Color : ${item.color}`;
    html += `, Clarity : ${item.clarity}`;
    html += `, Cut : ${item.cut}`;
    html += `, Polish : ${item.polish}`;
    html += `, Symmetry : ${item.symmetry}`;
    return html;
  }

  chatMessage(){
    this.router.navigate(['message']);
  }

  ParticularAddToWatchList(diamond){
    var diamond_id = parseInt(diamond)
    if (!this.DiamondList.includes(diamond_id)) {
      this.DiamondList.push(diamond_id);
    }else{
      const index1: number = this.DiamondList.indexOf(diamond_id);
      if (index1 !== -1) {
        this.DiamondList.splice(index1, 1);
      }
    }
    this.AddToWatchlist()
  }

  photoURL(name){
    var pattern = /^((http|https|ftp):\/\/)/;
    if(pattern.test(name)) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(name);
    }else{
      return this.sanitizer.bypassSecurityTrustResourceUrl(environment.backend_url+''+name);
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

  search_datatableInit(){
    this.searchlistData = []
    this.Search_saved = ''
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
      order:[[3, 'desc']],
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters['search_saved_id'] = this.search_saved_id
        dataTablesParameters['search_data'] = this.search_data

        dataTablesParameters['userId'] = this.userId
        this.http.PostAPI('users/newproduct',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.AllDiamondList = []
            this.searchlistData = resdata.response;
            for(var i=0; i<this.searchlistData.length; i++) {
              var diamond_id = parseInt(this.searchlistData[i].diamond_id)
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
            this.Search_saved = resdata.Search_saved;
            this.Pieces = resdata.TotalRecords['cnt']
            var sale_back = 0
            var sale_w_back = 0
            var old_cts = 0
            var Avg_Disc_temp = 0
            for (var i = 0; i < this.searchlistData.length; i++) {
              old_cts = old_cts + this.searchlistData[i].size
              sale_back = sale_back + parseFloat(this.searchlistData[i].sale_back);
              sale_w_back = sale_w_back + parseFloat(this.searchlistData[i].sale_price_back);
            }
            this.Cts = (old_cts).toFixed(2)
            Avg_Disc_temp = sale_back/this.Pieces
            this.Avg_Disc = (Avg_Disc_temp).toFixed(2)
            this.Total_Cr = sale_w_back/this.Pieces
            this.Amount = this.Total_Cr*old_cts
          } else {
            this.searchlistData = [];
            this.DiamondList = [];
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
            this.http.logout();
          }
          this.searchlistData = [];
          callback({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
          })
        })
      },
      columns: [
        { data: 'diamond_id',orderable:false,searchable:false},
        { data: 'action',orderable:false,searchable:false},
        { data: 'diamond_id',orderable:false,searchable:false},
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
        { data: 'created_at'},
        { data: 'availability'}
      ]
    }
    setTimeout(() => {
      this.rerender()
    }, 2000)
  }

  rerender() {
    // this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //   window.dispatchEvent(new Event('resize'));
    // });
    window.dispatchEvent(new Event('resize'));
  }

  ngOnInit(): void {
    this.search_datatableInit()
  }

}
