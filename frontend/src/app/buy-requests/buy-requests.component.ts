import {Component, OnInit, ViewChild} from '@angular/core';
import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';
import {Router, CanActivate} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {HttpService} from '../services/http.service';
import {FormBuilder, FormGroup, Validators, FormControl, AbstractControl} from '@angular/forms';
import {DataTableDirective} from 'angular-datatables';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx/dist/xlsx.js';

@Component({
  selector: 'app-buy-requests',
  templateUrl: './buy-requests.component.html',
  styleUrls: ['./buy-requests.component.css']
})
export class BuyRequestsComponent implements OnInit {

  request_submitted: boolean = false;
  RequestsForm: FormGroup;
  step: number = 2;
  public options: Options;
  public options1: Options;
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtOptions1: DataTables.Settings = {};
  search_data: {} = {
    shape_basic: '',
    shape_advanced: [],
    size_general_from: '',
    size_general_to: '',
    size_specific: [],
    color_white_intensity_from: '',
    color_white_intensity_to: '',
    color_white_overtone: '',
    color_white_color: '',
    color_fancy: [],
    clarity: [],
    inclusions_eye_clean: '',
    inclusions_milky_from: '',
    inclusions_milky_to: '',
    open_inclusions: [],
    white_inclusions: [],
    black_inclusions: [],
    shades: '',
    finish_general_cut_from: '',
    finish_general_cut_to: '',
    finish_general_polish_from: '',
    finish_general_polish_to: '',
    finish_general_symmetry_from: '',
    finish_general_symmetry_to: '',
    finish_specific: [],
    fluorescence_intensity: [],
    grading_report: [],
    location: '',
    specification: [],
    price_ct_from: '',
    price_ct_to: '',
    price_total_from: '',
    price_total_to: '',
    price_rap_from: '',
    price_rap_to: '',
    show_only: [],
    per_depth_from: '',
    per_depth_to: '',
    per_table_from: '',
    per_table_to: '',
    metric_length_from: '',
    metric_length_to: '',
    metric_width_from: '',
    metric_width_to: '',
    metric_depth_from: '',
    metric_depth_to: '',
    ratio_from: '',
    ratio_to: '',
    preset_ratio: '',
    crown_height_from: '',
    crown_height_to: '',
    crown_angle_from: '',
    crown_angle_to: '',
    pavilion_depth_from: '',
    pavilion_depth_to: '',
    pavilion_angle_from: '',
    pavilion_angle_to: '',
    girdle: [],
    culet_size: [],
    culet_condition: [],
    treatment: 'no-treatment',
    symbols: 'contains',
    symbol_checkbox: [],
    notify_daily: '',
    notify_immediately: '',
    expiration_date: '',
    comment: '',
  };
  search_data_filter: {} = {
    shape: '',
    size_from: '',
    size_to: '',
    clarity_from: '',
    clarity_to: '',
    cut_from: '',
    cut_to: '',
    polish_from: '',
    polish_to: '',
    create_date_from: '',
    create_date_to: '',
    expire_date_from: '',
    expire_date_to: '',
  }
  locationData = [];
  Open_Inclusions = [];
  Black_Inclusions = [];
  White_Inclusions = [];
  userId = '';
  email = '';
  Allsearchlist: any[] = [];
  searchlist: any[] = [];
  buy_requests_id = '';
  filter_popup = false;
  extendid: any = 0;

  constructor(public router: Router, public toastr: ToastrService, public http: HttpService, private formBuilder: FormBuilder) {
    if (localStorage.getItem('User')){
      let CurrentUser = JSON.parse(localStorage.getItem('User'));
      this.userId = CurrentUser.userId;
      this.email = CurrentUser.email;
    }
  }

  ngOnInit(): void {
    // this.RequestsForm = new FormGroup({
    //   comment: new FormControl({ value: '' }, Validators.compose([Validators.required])),
    // });
    this.Open_Inclusions = [
      {
        id:"NON",
        text:"Open Inclusions None"
      },
      {
        id:"OT1",
        text:"Open Table Small"
      },
      {
        id:"OT2",
        text:"Open Table Medium"
      },
      {
        id:"OT3",
        text:"Open Table Large"
      },
      {
        id:"OC1",
        text:"Open Crown Small"
      },
      {
        id:"OC2",
        text:"Open Crown Medium"
      },
      {
        id:"OC3",
        text:"Open Crown Large"
      },
      {
        id:"OP1",
        text:"Open Pavilion Small"
      },
      {
        id:"OP2",
        text:"Open Pavilion Medium"
      },
      {
        id:"OP3",
        text:"Open Pavilion Large"
      },
      {
        id:"OG1",
        text:"Open Girdle Small"
      },
      {
        id:"OG2",
        text:"Open Girdle Medium"
      },
      {
        id:"OG3",
        text:"Open Girdle Large"
      }
    ]
    this.Black_Inclusions = [
      {
        id:"NON",
        text:"Black Inclusions None"
      },
      {
        id:"BT0",
        text: "Black Table Meaningless"
      },
      {
        id:"BT1",
        text:"Black Table Small"
      },
      {
        id:"BT2",
        text:"Black Table Medium"
      },
      {
        id:"BT3",
        text:"Black Table Large"
      },
      {
        id:"BC0",
        text:"Black Crown Meaningless"
      },
      {
        id:"BC1",
        text:"Black Crown Small"
      },
      {
        id:"BC2",
        text:"Black Crown Medium"
      },
      {
        id: "BC3",
        text: "Black Crown Large"
      }
    ];
    this.White_Inclusions = [
      {
        id: "NON",
        text: "White Inclusions None"
      },
      {
        id: "WT0",
        text: "White Table Meaningless"
      },
      {
        id: "WT1",
        text: "White Table Small"
      },
      {
        id: "WT2",
        text: "White Table Medium"
      },
      {
        id: "WT3",
        text: "White Table Large"
      },
      {
        id: "WC0",
        text: "White Crown Meaningless"
      },
      {
        id: "WC1",
        text: "White Crown Small"
      },
      {
        id: "WC2",
        text: "White Crown Medium"
      },
      {
        id: "WC3",
        text: "White Crown Large"
      }
    ];
    this.locationData = [
      {
        id:"US",
        text:"USA"
      },
      {
        id:"LA",
        text:"Los Angeles"
      },
      {
        id:"CH",
        text:"Chicago"
      },
      {
        id:"IN",
        text:"India"
      },
      {
        id:"NY",
        text:"New York"
      },
      {
        id:"HK",
        text:"Hong kong"
      },
      {
        id:"BE",
        text:"Belgium"
      },
      {
        id:"EU",
        text:"Europe"
      },
      {
        id:"CH",
        text:"China"
      },
      {
        id:"JP",
        text:"Japan"
      }
    ];
    this.options = {
      width: 390,
      multiple: true
    };
    this.options1 = {
      width: 390
    };
    this.AlldatatableInit()
    this.datatableInit()
  }

  get f() { return this.RequestsForm.controls; }

  paginate:any =  {
    oPaginate: {
      sPrevious: '<i class="fa fa-angle-left"></i>',
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
      responsive: true,
      searching:false,
      processing: true,
      order:[[0, 'desc']],
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters['search_data_filter'] = this.search_data_filter
        dataTablesParameters['search_data'] = this.search_data
        dataTablesParameters['userId'] = this.userId
        this.http.PostAPI('users/searchBuyRequests',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.searchlist = resdata.response;
            this.redederSet();
            // this.rerender()
            // console.log('searchlist::: ' + JSON.stringify(this.searchlist))
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
        { data: 'br.buy_requests_id',orderable:false,searchable:false},
        { data: 'shape_advanced'},
        { data: 'size_general_from'},
        { data: 'color_fancy'},
        { data: 'clarity'},
        { data: 'price'},
        { data: 'location'},
        { data: 'created_at', orderable:false,searchable:false},
        { data: 'expiration_date', orderable:false,searchable:false},
        { data: 'stance', orderable:false,searchable:false},
        { data: 'status',orderable:false},
        { data: 'action',orderable:false}
      ]
    }
    setTimeout(() => {
      this.rerender()
    }, 2500)
  }

  rerender() {
    window.dispatchEvent(new Event('resize'));
  }
  redederSet() {
    setTimeout(() => {
      this.rerender()
    }, 2500)
  }

  timer: any = "";
  filterById() {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.ReloadDatatable()
    }, 1500)
  }

  ReloadDatatable() {
    // this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //   dtInstance.ajax.reload();
    // });
    $('.my-requests').DataTable().ajax.reload();
    window.dispatchEvent(new Event('resize'));
  }

  AlldatatableInit(){
    this.dtOptions1 = {
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
        dataTablesParameters['search_data_filter'] = this.search_data_filter
        dataTablesParameters['search_data'] = this.search_data
        this.http.PostAPI('users/searchBuyRequests',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.Allsearchlist = resdata.response;
          } else {
            this.Allsearchlist = [];
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
          this.Allsearchlist = [];
          callback({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
          })
        })
      },
      columns: [
        { data: 'br.userId'},
        { data: 'shape_advanced'},
        { data: 'size_general_from'},
        { data: 'color_fancy'},
        { data: 'clarity'},
        { data: 'price'},
        { data: 'location'},
        { data: 'created_at', orderable:false,searchable:false},
        { data: 'expiration_date', orderable:false,searchable:false},
        { data: 'status',orderable:false},
      ]
    }
  }

  timer1:any="";
  filterById1() {
    clearTimeout(this.timer1)
    this.timer1=setTimeout(()=>{
      this.ReloadDatatable1()
    },1500)
  }

  ReloadDatatable1(){
    $('.all-requests').DataTable().ajax.reload();
    window.dispatchEvent(new Event('resize'));
  }

  check_filter(){
    this.filter_popup = true
    $('body').addClass('filter-pop-open')
    $("body").after('<div class="filter-src-backdroup"></div');
  }

  close_filter(){
    this.filter_popup = false
    $('body').removeClass('filter-pop-open');
    $('.filter-src-backdroup').remove()
  }

  isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  checkStep(step){
    this.step = step
    if(this.step == 3){
      this.buy_requests_id = ''
      this.searchreset()
    }
  }

  searchfilterreset(){
    this.search_data_filter = {
      shape: '',
      size_from: '',
      size_to: '',
      clarity_from: '',
      clarity_to: '',
      cut_from: '',
      cut_to: '',
      polish_from: '',
      polish_to: '',
      create_date_from: '',
      create_date_to: '',
      expire_date_from: '',
      expire_date_to: '',
    }
  }

  searchselectfilter(val:any,field:string){
    if(field == 'shape'){
      this.search_data_filter['shape'] = val
    }else if(field == 'size_from'){
      this.search_data_filter['size_from'] = val
    }else if(field == 'size_to'){
      this.search_data_filter['size_to'] = val
    }else if(field == 'clarity_from'){
      this.search_data_filter['clarity_from'] = val
    }else if(field == 'clarity_to'){
      this.search_data_filter['clarity_to'] = val
    }else if(field == 'cut_from'){
      this.search_data_filter['cut_from'] = val
    }else if(field == 'cut_to'){
      this.search_data_filter['cut_to'] = val
    }else if(field == 'polish_from'){
      this.search_data_filter['polish_from'] = val
    }else if(field == 'polish_to'){
      this.search_data_filter['polish_to'] = val
    }else if(field == 'create_date_from'){
      this.search_data_filter['create_date_from'] = val
    }else if(field == 'create_date_to'){
      this.search_data_filter['create_date_to'] = val
    }else if(field == 'expire_date_from'){
      this.search_data_filter['expire_date_from'] = val
    }else if(field == 'expire_date_to'){
      this.search_data_filter['expire_date_to'] = val
    }
  }

  searchselect(val:any,field:string){
    if(field == 'shape_advanced'){
      if(this.search_data['shape_advanced'].includes(val)){
        this.search_data['shape_advanced'] = this.search_data['shape_advanced'].filter((e:any)=>e!=val)
      }else{
        this.search_data['shape_advanced'].push(val)
      }
    }else if(field == 'shape_basic'){
      this.search_data['shape_basic'] = val
    }else if(field == 'size_general_from'){
      this.search_data['size_general_from'] = val
    }else if(field == 'size_general_to'){
      this.search_data['size_general_to'] = val
    }else if(field == 'size_specific'){
      if(this.search_data['size_specific'].includes(val)){
        this.search_data['size_specific'] = this.search_data['size_specific'].filter((e:any)=>e!=val)
      }else{
        this.search_data['size_specific'].push(val)
      }
    }else if(field == 'color_fancy'){
      if(this.search_data['color_fancy'].includes(val)){
        this.search_data['color_fancy'] = this.search_data['color_fancy'].filter((e:any)=>e!=val)
      }else{
        this.search_data['color_fancy'].push(val)
      }
    }else if(field == 'color_white_intensity_from'){
      this.search_data['color_white_intensity_from'] = val
    }else if(field == 'color_white_intensity_to'){
      this.search_data['color_white_intensity_to'] = val
    }else if(field == 'color_white_overtone'){
      this.search_data['color_white_overtone'] = val
    }else if(field == 'color_white_color'){
      this.search_data['color_white_color'] = val
    }else if(field == 'clarity'){
      if(this.search_data['clarity'].includes(val)){
        this.search_data['clarity'] = this.search_data['clarity'].filter((e:any)=>e!=val)
      }else{
        this.search_data['clarity'].push(val)
      }
    }else if(field == 'inclusions_eye_clean'){
      this.search_data['inclusions_eye_clean'] = val
    }else if(field == 'inclusions_milky_from'){
      this.search_data['inclusions_milky_from'] = val
    }else if(field == 'inclusions_milky_to'){
      this.search_data['inclusions_milky_to'] = val
    }else if(field == 'open_inclusions'){
      if(this.search_data['open_inclusions'].includes(val)){
        this.search_data['open_inclusions'] = this.search_data['open_inclusions'].filter((e:any)=>e!=val)
      }else{
        this.search_data['open_inclusions'].push(val)
      }
    }else if(field == 'white_inclusions'){
      if(this.search_data['white_inclusions'].includes(val)){
        this.search_data['white_inclusions'] = this.search_data['white_inclusions'].filter((e:any)=>e!=val)
      }else{
        this.search_data['white_inclusions'].push(val)
      }
    }else if(field == 'black_inclusions'){
      if(this.search_data['black_inclusions'].includes(val)){
        this.search_data['black_inclusions'] = this.search_data['black_inclusions'].filter((e:any)=>e!=val)
      }else{
        this.search_data['black_inclusions'].push(val)
      }
    }else if(field == 'shades'){
      this.search_data['shades'] = val
    }else if(field == 'finish_general_cut_from'){
      this.search_data['finish_general_cut_from'] = val
    }else if(field == 'finish_general_cut_to'){
      this.search_data['finish_general_cut_to'] = val
    }else if(field == 'finish_general_polish_from'){
      this.search_data['finish_general_polish_from'] = val
    }else if(field == 'finish_general_polish_to'){
      this.search_data['finish_general_polish_to'] = val
    }else if(field == 'finish_general_symmetry_from'){
      this.search_data['finish_general_symmetry_from'] = val
    }else if(field == 'finish_general_symmetry_to'){
      this.search_data['finish_general_symmetry_to'] = val
    }else if(field == 'finish_specific'){
      if(this.search_data['finish_specific'].includes(val)){
        this.search_data['finish_specific'] = this.search_data['finish_specific'].filter((e:any)=>e!=val)
      }else{
        this.search_data['finish_specific'].push(val)
      }
    }else if(field == 'fluorescence_intensity'){
      if(this.search_data['fluorescence_intensity'].includes(val)){
        this.search_data['fluorescence_intensity'] = this.search_data['fluorescence_intensity'].filter((e:any)=>e!=val)
      }else{
        this.search_data['fluorescence_intensity'].push(val)
      }
    }else if(field == 'grading_report'){
      if(this.search_data['grading_report'].includes(val)){
        this.search_data['grading_report'] = this.search_data['grading_report'].filter((e:any)=>e!=val)
      }else{
        this.search_data['grading_report'].push(val)
      }
    }else if(field == 'location'){
      this.search_data['location'] = val
    }else if(field == 'specification'){
      if(this.search_data['specification'].includes(val)){
        this.search_data['specification'] = this.search_data['specification'].filter((e:any)=>e!=val)
      }else{
        this.search_data['specification'].push(val)
      }
    }else if(field == 'price_ct_from'){
      this.search_data['price_ct_from'] = val
    }else if(field == 'price_ct_to'){
      this.search_data['price_ct_to'] = val
    }else if(field == 'price_total_from'){
      this.search_data['price_total_from'] = val
    }else if(field == 'price_total_to'){
      this.search_data['price_total_to'] = val
    }else if(field == 'price_rap_from'){
      this.search_data['price_rap_from'] = val
    }else if(field == 'price_rap_to'){
      this.search_data['price_rap_to'] = val
    }else if(field == 'show_only'){
      if(this.search_data['show_only'].includes(val)){
        this.search_data['show_only'] = this.search_data['show_only'].filter((e:any)=>e!=val)
      }else{
        this.search_data['show_only'].push(val)
      }
    }else if(field == 'per_depth_from'){
      this.search_data['per_depth_from'] = val
    }else if(field == 'per_depth_to'){
      this.search_data['per_depth_to'] = val
    }else if(field == 'per_table_from'){
      this.search_data['per_table_from'] = val
    }else if(field == 'per_table_to'){
      this.search_data['per_table_to'] = val
    }else if(field == 'metric_length_from'){
      this.search_data['metric_length_from'] = val
    }else if(field == 'metric_length_to'){
      this.search_data['metric_length_to'] = val
    }else if(field == 'metric_width_from'){
      this.search_data['metric_width_from'] = val
    }else if(field == 'metric_width_to'){
      this.search_data['metric_width_to'] = val
    }else if(field == 'metric_depth_from'){
      this.search_data['metric_depth_from'] = val
    }else if(field == 'metric_depth_to'){
      this.search_data['metric_depth_to'] = val
    }else if(field == 'ratio_from'){
      this.search_data['ratio_from'] = val
    }else if(field == 'ratio_to'){
      this.search_data['ratio_to'] = val
    }else if(field == 'preset_ratio'){
      this.search_data['preset_ratio'] = val
    }else if(field == 'crown_height_from'){
      this.search_data['crown_height_from'] = val
    }else if(field == 'crown_height_to'){
      this.search_data['crown_height_to'] = val
    }else if(field == 'crown_angle_from'){
      this.search_data['crown_angle_from'] = val
    }else if(field == 'crown_angle_to'){
      this.search_data['crown_angle_to'] = val
    }else if(field == 'pavilion_depth_from'){
      this.search_data['pavilion_depth_from'] = val
    }else if(field == 'pavilion_depth_to'){
      this.search_data['pavilion_depth_to'] = val
    }else if(field == 'pavilion_angle_from'){
      this.search_data['pavilion_angle_from'] = val
    }else if(field == 'pavilion_angle_to'){
      this.search_data['pavilion_angle_to'] = val
    }else if(field == 'girdle'){
      if(this.search_data['girdle'].includes(val)){
        this.search_data['girdle'] = this.search_data['girdle'].filter((e:any)=>e!=val)
      }else{
        this.search_data['girdle'].push(val)
      }
    }else if(field == 'culet_size'){
      if(this.search_data['culet_size'].includes(val)){
        this.search_data['culet_size'] = this.search_data['culet_size'].filter((e:any)=>e!=val)
      }else{
        this.search_data['culet_size'].push(val)
      }
    }else if(field == 'culet_condition'){
      if(this.search_data['culet_condition'].includes(val)){
        this.search_data['culet_condition'] = this.search_data['culet_condition'].filter((e:any)=>e!=val)
      }else{
        this.search_data['culet_condition'].push(val)
      }
    }else if(field == 'treatment'){
      this.search_data['treatment'] = val
    }else if(field == 'symbols'){
      this.search_data['symbols'] = val
    }else if(field == 'symbol_checkbox') {
      if (this.search_data['symbol_checkbox'].includes(val)) {
        this.search_data['symbol_checkbox'] = this.search_data['symbol_checkbox'].filter((e: any) => e != val)
      } else {
        this.search_data['symbol_checkbox'].push(val)
      }
    }else if(field == 'notify_daily'){
        this.search_data['notify_daily'] = val
    }else if(field == 'notify_immediately'){
      this.search_data['notify_immediately'] = val
    }else if(field == 'expiration_date'){
      this.search_data['expiration_date'] = val
    }else if(field == 'comment'){
      this.search_data['comment'] = val
    }
  }

  searchreset(){
    this.search_data = {
      shape_basic: '',
      shape_advanced: [],
      size_general_from: '',
      size_general_to: '',
      size_specific: [],
      color_white_intensity_from: '',
      color_white_intensity_to: '',
      color_white_overtone: '',
      color_white_color: '',
      color_fancy: [],
      clarity: [],
      inclusions_eye_clean: '',
      inclusions_milky_from: '',
      inclusions_milky_to: '',
      open_inclusions:[],
      white_inclusions:[],
      black_inclusions:[],
      shades: '',
      finish_general_cut_from: '',
      finish_general_cut_to: '',
      finish_general_polish_from: '',
      finish_general_polish_to: '',
      finish_general_symmetry_from: '',
      finish_general_symmetry_to: '',
      finish_specific: [],
      fluorescence_intensity: [],
      grading_report: [],
      location: '',
      specification: [],
      price_ct_from: '',
      price_ct_to: '',
      price_total_from: '',
      price_total_to: '',
      price_rap_from: '',
      price_rap_to: '',
      show_only: [],
      per_depth_from: '',
      per_depth_to: '',
      per_table_from: '',
      per_table_to: '',
      metric_length_from: '',
      metric_length_to: '',
      metric_width_from: '',
      metric_width_to: '',
      metric_depth_from: '',
      metric_depth_to: '',
      ratio_from: '',
      ratio_to: '',
      preset_ratio: '',
      crown_height_from: '',
      crown_height_to: '',
      crown_angle_from: '',
      crown_angle_to: '',
      pavilion_depth_from: '',
      pavilion_depth_to: '',
      pavilion_angle_from: '',
      pavilion_angle_to: '',
      girdle: [],
      culet_size: [],
      culet_condition: [],
      treatment: 'no-treatment',
      symbols: 'contains',
      symbol_checkbox: [],
      notify_daily: '',
      notify_immediately: '',
      expiration_date: '',
      comment: '',
    }
  }

  change_status(buy_requests_id) {
    var data = { buy_requests_id: buy_requests_id }
    this.http.PostAPI('users/ChangeStatusRequests', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.ReloadDatatable()
        this.ReloadDatatable1()
      } else {
        this.toastr.error(resdata.message)
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  SelectedShape = [];
  SelectedSize = [];
  SelectedColor = [];
  SelectedSymbols = [];
  SelectedClarity = [];
  SelectedOpen = [];
  SelectedBlack = [];
  SelectedWhite = [];
  SelectedFinishSpecific = [];
  SelectedFluorescenceIntensity = [];
  SelectedGradingReport = [];
  SelectedSpecification = [];
  SelectedShowOnly = [];
  SelectedGirdle = [];
  SelectedCuletSize = [];
  SelectedCuletCondition = [];
  edit_requests(buy_requests_id){
    this.buy_requests_id = buy_requests_id
    var data = {buy_requests_id:this.buy_requests_id}
    this.http.PostAPI('users/GetBuyRequests', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.step = 3
        if(resdata.data.shape_advanced != null){
          this.SelectedShape = resdata.data.shape_advanced.split(",")
        }
        if(resdata.data.size_specific != null){
          this.SelectedSize = resdata.data.size_specific.split(",")
        }
        if(resdata.data.color_fancy != null){
          this.SelectedColor = resdata.data.color_fancy.split(",")
        }
        if(resdata.data.symbol_checkbox != null){
          this.SelectedSymbols = resdata.data.symbol_checkbox.split(",")
        }
        if(resdata.data.open_inclusions != null){
          this.SelectedOpen = resdata.data.open_inclusions.split(",")
        }
        if(resdata.data.black_inclusions != null){
          this.SelectedBlack = resdata.data.black_inclusions.split(",")
        }
        if(resdata.data.white_inclusions != null){
          this.SelectedWhite = resdata.data.white_inclusions.split(",")
        }
        if(resdata.data.clarity != null){
          this.SelectedClarity = resdata.data.clarity.split(",")
        }
        if(resdata.data.finish_specific != null){
          this.SelectedFinishSpecific = resdata.data.finish_specific.split(",")
        }
        if(resdata.data.fluorescence_intensity != null){
          this.SelectedFluorescenceIntensity = resdata.data.fluorescence_intensity.split(",")
        }
        if(resdata.data.grading_report != null){
          this.SelectedGradingReport = resdata.data.grading_report.split(",")
        }
        if(resdata.data.specification != null){
          this.SelectedSpecification = resdata.data.specification.split(",")
        }
        if(resdata.data.show_only != null){
          this.SelectedShowOnly = resdata.data.show_only.split(",")
        }
        if(resdata.data.girdle != null){
          this.SelectedGirdle = resdata.data.girdle.split(",")
        }
        if(resdata.data.culet_size != null){
          this.SelectedCuletSize = resdata.data.culet_size.split(",")
        }
        if(resdata.data.culet_condition != null){
          this.SelectedCuletCondition = resdata.data.culet_condition.split(",")
        }
        this.search_data = {
          shape_basic: resdata.data.shape_basic,
          shape_advanced: this.SelectedShape,
          size_general_from: resdata.data.size_general_from,
          size_general_to: resdata.data.size_general_to,
          size_specific: this.SelectedSize,
          color_white_intensity_from: resdata.data.color_white_intensity_from,
          color_white_intensity_to: resdata.data.color_white_intensity_to,
          color_white_overtone: resdata.data.color_white_overtone,
          color_white_color: resdata.data.color_white_color,
          color_fancy: this.SelectedColor,
          clarity: this.SelectedClarity,
          inclusions_eye_clean: resdata.data.inclusions_eye_clean,
          inclusions_milky_from: resdata.data.inclusions_milky_from,
          inclusions_milky_to: resdata.data.inclusions_milky_to,
          open_inclusions:this.SelectedOpen,
          white_inclusions:this.SelectedWhite,
          black_inclusions:this.SelectedBlack,
          shades: resdata.data.inclusions_milky_to,
          finish_general_cut_from: resdata.data.finish_general_cut_from,
          finish_general_cut_to: resdata.data.finish_general_cut_from,
          finish_general_polish_from: resdata.data.finish_general_cut_from,
          finish_general_polish_to: resdata.data.finish_general_cut_from,
          finish_general_symmetry_from: resdata.data.finish_general_cut_from,
          finish_general_symmetry_to: resdata.data.finish_general_cut_from,
          finish_specific: this.SelectedFinishSpecific,
          fluorescence_intensity: this.SelectedFluorescenceIntensity,
          grading_report: this.SelectedGradingReport,
          location: resdata.data.location,
          specification: this.SelectedSpecification,
          price_ct_from: resdata.data.price_ct_from,
          price_ct_to: resdata.data.price_ct_to,
          price_total_from: resdata.data.price_total_from,
          price_total_to: resdata.data.price_total_to,
          price_rap_from: resdata.data.price_rap_from,
          price_rap_to: resdata.data.price_rap_to,
          show_only: this.SelectedShowOnly,
          per_depth_from: resdata.data.per_depth_from,
          per_depth_to: resdata.data.per_depth_to,
          per_table_from: resdata.data.per_table_from,
          per_table_to: resdata.data.per_table_to,
          metric_length_from: resdata.data.metric_length_from,
          metric_length_to: resdata.data.metric_length_to,
          metric_width_from: resdata.data.metric_width_from,
          metric_width_to: resdata.data.metric_width_to,
          metric_depth_from: resdata.data.metric_depth_from,
          metric_depth_to: resdata.data.metric_depth_to,
          ratio_from: resdata.data.ratio_from,
          ratio_to: resdata.data.ratio_to,
          preset_ratio: resdata.data.preset_ratio,
          crown_height_from: resdata.data.crown_height_from,
          crown_height_to: resdata.data.crown_height_to,
          crown_angle_from: resdata.data.crown_angle_from,
          crown_angle_to: resdata.data.crown_angle_to,
          pavilion_depth_from: resdata.data.pavilion_depth_from,
          pavilion_depth_to: resdata.data.pavilion_depth_to,
          pavilion_angle_from: resdata.data.pavilion_angle_from,
          pavilion_angle_to: resdata.data.pavilion_angle_to,
          girdle: this.SelectedGirdle,
          culet_size: this.SelectedCuletSize,
          culet_condition: this.SelectedCuletCondition,
          treatment: resdata.data.treatment,
          symbols: resdata.data.symbols,
          symbol_checkbox: this.SelectedSymbols,
          notify_daily: resdata.data.notify_daily,
          notify_immediately: resdata.data.notify_immediately,
          expiration_date: resdata.data.expiration_date,
          comment: resdata.data.comment,
        }
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  postrequests(){
    // this.request_submitted = true
    // if(this.RequestsForm.invalid) {
    //   return
    // }
    var data = { search_data: this.search_data, userId: this.userId, buy_requests_id:this.buy_requests_id }
    this.http.PostAPI('users/UploadBuyRequests', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.ReloadDatatable()
        this.ReloadDatatable1()
        this.step = 2
      } else {
        this.toastr.error(resdata.message)
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  searchfilter(){
    this.ReloadDatatable()
    this.ReloadDatatable1()
    this.close_filter()
  }

  delete_requests(data) {
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
        this.http.PostAPI('users/removeRequests', data).then((resdata: any) => {
          if (resdata.status == 200) {
            this.toastr.success(resdata.message);
            this.ReloadDatatable()
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
  chatMessage(){
    this.router.navigate(['message']);
  }

}
