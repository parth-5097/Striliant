import {Component, OnInit, ViewChild } from '@angular/core';
import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';
import {Router, CanActivate, ActivatedRoute} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {HttpService} from '../services/http.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataTableDirective} from 'angular-datatables';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx/dist/xlsx.js';
import {environment} from '../../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';
import {HeaderComponent} from '../header/header.component';
import {ngxCsv} from 'ngx-csv';
import { DiamondsDetailsComponent } from '../diamonds-details/diamonds-details.component';

@Component({
  selector: 'app-diamonds',
  templateUrl: './diamonds.component.html',
  styleUrls: ['./diamonds.component.css']
})
export class DiamondsComponent implements OnInit {

  @ViewChild(HeaderComponent) Header;
  public locationData: Array<Select2OptionData>;
  public options: Options;
  redirectedPage: boolean;
  Report_file: File;
  Diamond_file: File;
  step:number=1
  Report_img=''
  Diamond_img=''
  Symbols = []
  Open_Inclusions = []
  Black_Inclusions = []
  White_Inclusions = []
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  searchlist:any[]=[];
  searchlistData:any[]=[];
  diamond_id = ''
  importData = ''
  DiamondWatchList = [];
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
  userId = ''
  email = ''
  seraching_div = false
  frontend_url = ''
  extendid:any=0;
  pager = {};
  pageOfItems = [];
  totalItems = 0;
  pages = []
  currentPage = 1
  totalPages = 1
  startIndex = 0
  endIndex = 5
  parsedJson: any;
  search_saved_id = ''
  Pieces = 0
  Cts;
  Avg_Disc;
  Total_Cr;
  Amount;
  Search_saved = ''

  isMasterChecked = false;
  isChecked = false;
  cartList = []
  DiamondList = []
  AllDiamondList = []
  cartId = ''
  watchListId = ''
  checkSession: any = false;

  constructor(private sanitizer: DomSanitizer, public router: Router, public toastr: ToastrService, public http: HttpService, private formBuilder: FormBuilder,private route: ActivatedRoute) {
    if(localStorage.getItem('User')){
      let CurrentUser = JSON.parse(localStorage.getItem('User'));
      this.checkSession = sessionStorage.getItem('DiamondsDetailSession');
      if (sessionStorage.getItem('DiamondsDetailSession') == 'true'){
        this.sessionStore();
      }

      this.userId = CurrentUser.userId;
      this.email = CurrentUser.email;
    }
  }

  ngOnInit(): void {
    this.cartItem()
    this.frontend_url = this.http.frontendurl
    this.Symbols = [
      {
        id:'N',
        text:'None'
      },
      {
        id:'Bearding',
        text:'Bearding'
      },
      {
        id:'Brown patch of color',
        text:'Brown patch of color'
      },
      {
        id:'Bruise',
        text:'Bruise'
      },
      {
        id:'Cavity',
        text:'Cavity'
      },
      {
        id:'Chip',
        text:'Chip'
      },
      {
        id:'Cleavage',
        text:'Cleavage'
      },
      {
        id:'Cloud',
        text:'Cloud'
      },
      {
        id:'Crystal',
        text:'Crystal'
      },
      {
        id:'Crystal Surface',
        text:'Crystal Surface'
      },
      {
        id:'Etch Channel',
        text:'Etch Channel'
      },
      {
        id:'Extra Facet',
        text:'Extra Facet'
      },
      {
        id:'Feather',
        text:'Feather'
      },
      {
        id:'Flux Remnant',
        text:'Flux Remnant'
      },
      {
        id:'Indented Natural',
        text:'Indented Natural'
      },
      {
        id:'Internal Graining',
        text:'Internal Graining'
      },
      {
        id:'Internal Inscription',
        text:'Internal Inscription'
      },
      {
        id:'Internal Laser Drilling',
        text:'Internal Laser Drilling'
      },
      {
        id:'Knot',
        text:'Knot'
      },
      {
        id:'Laser Drill Hole',
        text:'Laser Drill Hole'
      },
      {
        id:'Manufacturing Remnant',
        text:'Manufacturing Remnant'
      },
      {
        id:'Minor Details of Polish',
        text:'Minor Details of Polish'
      },
      {
        id:'Natural',
        text:'Natural'
      },
      {
        id:'Needle',
        text:'Needle'
      },
      {
        id:'No Inclusion',
        text:'No Inclusion'
      },
      {
        id:'Pinpoint',
        text:'Pinpoint'
      },
      {
        id:'Reflecting Surface Graining',
        text:'Reflecting Surface Graining'
      },
      {
        id:'Surface Graining',
        text:'Surface Graining'
      },
      {
        id:'Twinning Wisp',
        text:'Twinning Wisp'
      }
    ];
    this.Open_Inclusions = [
      {
        id:'N',
        text:'Open Inclusions None'
      },
      {
        id:'OT1',
        text:'Open Table Small'
      },
      {
        id:'OT2',
        text:'Open Table Medium'
      },
      {
        id:'OT3',
        text:'Open Table Large'
      },
      {
        id:'OC1',
        text:'Open Crown Small'
      },
      {
        id:'OC2',
        text:'Open Crown Medium'
      },
      {
        id:'OC3',
        text:'Open Crown Large'
      },
      {
        id:'OP1',
        text:'Open Pavilion Small'
      },
      {
        id:'OP2',
        text:'Open Pavilion Medium'
      },
      {
        id:'OP3',
        text:'Open Pavilion Large'
      },
      {
        id:'OG1',
        text:'Open Girdle Small'
      },
      {
        id:'OG2',
        text:'Open Girdle Medium'
      },
      {
        id:'OG3',
        text:'Open Girdle Large'
      }
    ]
    this.Black_Inclusions = [
      {
        id:'N',
        text:'Black Inclusions None'
      },
      {
        id:'BT0',
        text: 'Black Table Meaningless'
      },
      {
        id:'BT1',
        text:'Black Table Small'
      },
      {
        id:'BT2',
        text:'Black Table Medium'
      },
      {
        id:'BT3',
        text:'Black Table Large'
      },
      {
        id:'BC0',
        text:'Black Crown Meaningless'
      },
      {
        id:'BC1',
        text:'Black Crown Small'
      },
      {
        id:'BC2',
        text:'Black Crown Medium'
      },
      {
        id: 'BC3',
        text: 'Black Crown Large'
      }
    ];
    this.White_Inclusions = [
      {
        id: 'N',
        text: 'White Inclusions None'
      },
      {
        id: 'WT0',
        text: 'White Table Meaningless'
      },
      {
        id: 'WT1',
        text: 'White Table Small'
      },
      {
        id: 'WT2',
        text: 'White Table Medium'
      },
      {
        id: 'WT3',
        text: 'White Table Large'
      },
      {
        id: 'WC0',
        text: 'White Crown Meaningless'
      },
      {
        id: 'WC1',
        text: 'White Crown Small'
      },
      {
        id: 'WC2',
        text: 'White Crown Medium'
      },
      {
        id: 'WC3',
        text: 'White Crown Large'
      }
    ]
    this.locationData = [
      {
        id:'US',
        text:'USA'
      },
      {
        id:'LA',
        text:'Los Angeles'
      },
      {
        id:'CH',
        text:'Chicago'
      },
      {
        id:'IN',
        text:'India'
      },
      {
        id:'NY',
        text:'New York'
      },
      {
        id:'HK',
        text:'Hong kong'
      },
      {
        id:'BE',
        text:'Belgium'
      },
      {
        id:'EU',
        text:'Europe'
      },
      {
        id:'CH',
        text:'China'
      },
      {
        id:'JP',
        text:'Japan'
      }
    ];
    this.options = {
      width: 410,
      multiple: true
    };
    this.upload_form()
    this.file_form()
    this.file_form1()
    //this.datatableInit()
    this.import_form()
    this.loadPage(1)
  }

  loadPage(page) {
    var data = {userId:this.userId, page : page}
    this.http.PostAPI('users/GetSavedSearched', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.pager = resdata.pager;
        this.totalItems = resdata.pager.totalItems;
        this.pages = resdata.pager.pages;
        this.currentPage = resdata.pager.currentPage;
        this.totalPages = resdata.pager.totalPages;
        this.startIndex = resdata.pager.startIndex;
        this.endIndex = resdata.pager.endIndex;
        this.pageOfItems = resdata.pageOfItems;
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  isNumberKey1(e){
    if (e.which != 46 && e.which != 45 && e.which != 46 && !(e.which >= 48 && e.which <= 57)) {
      return false;
    } else {
      return true;
    }

  }

  parse(body,key){
    this.parsedJson = JSON.parse(body);
    if(key == 'shape_advanced'){
       return this.parsedJson.shape_advanced.toString()
    }else if(key == 'shape_basic'){
      return this.parsedJson.shape_basic
    }else if(key == 'size_from'){
      return this.parsedJson.size_general_from
    }else if(key == 'size_to'){
      return this.parsedJson.size_general_to
    }else if(key == 'size_specific'){
      return this.parsedJson.size_specific.toString()
    }else if(key == 'color_fancy'){
      return this.parsedJson.color_fancy.toString()
    }else if(key == 'color_white_intensity_from'){
      return this.parsedJson.color_white_intensity_from
    }else if(key == 'color_white_intensity_to'){
      return this.parsedJson.color_white_intensity_to
    }else if(key == 'clarity'){
      return this.parsedJson.clarity.toString()
    }else if(key == 'finish_general_cut_from'){
      return this.parsedJson.finish_general_cut_from
    }else if(key == 'finish_general_cut_to'){
      return this.parsedJson.finish_general_cut_to
    }else if(key == 'finish_general_polish_from'){
      return this.parsedJson.finish_general_polish_from
    }else if(key == 'finish_general_polish_to') {
      return this.parsedJson.finish_general_polish_to
    }else if(key == 'finish_general_symmetry_from'){
      return this.parsedJson.finish_general_symmetry_from
    }else if(key == 'finish_general_symmetry_to'){
      return this.parsedJson.finish_general_symmetry_to
    }else if(key == 'finish_specific'){
      return this.parsedJson.finish_specific.toString()
    }else if(key == 'fluorescence_intensity'){
      return this.parsedJson.fluorescence_intensity.toString()
    }else if(key == 'grading_report'){
      return this.parsedJson.grading_report.toString()
    }else if(key == 'specification'){
      return this.parsedJson.specification.toString()
    }else if(key == 'show_only'){
      return this.parsedJson.show_only.toString()
    }else if(key == 'my_notes'){
      return this.parsedJson.my_notes.toString()
    }else if(key == 'media'){
      return this.parsedJson.media.toString()
    }else if(key == 'per_depth_from'){
      return this.parsedJson.per_depth_from
    }else if(key == 'per_depth_to'){
      return this.parsedJson.per_depth_to
    }else if(key == 'per_table_from'){
      return this.parsedJson.per_table_from
    }else if(key == 'per_table_to'){
      return this.parsedJson.per_table_to
    }else if(key == 'metric_length_from'){
      return this.parsedJson.metric_length_from
    }else if(key == 'metric_length_to'){
      return this.parsedJson.metric_length_to
    }else if(key == 'metric_width_from'){
      return this.parsedJson.metric_width_from
    }else if(key == 'metric_width_to'){
      return this.parsedJson.metric_width_to
    }else if(key == 'metric_depth_from'){
      return this.parsedJson.metric_depth_from
    }else if(key == 'metric_depth_to'){
      return this.parsedJson.metric_depth_to
    }else if(key == 'ratio_from'){
      return this.parsedJson.ratio_from
    }else if(key == 'ratio_to'){
      return this.parsedJson.ratio_to
    }else if(key == 'preset_ratio'){
      return this.parsedJson.ratio_to
    }else if(key == 'crown_height_from'){
      return this.parsedJson.crown_height_from
    }else if(key == 'crown_height_to'){
      return this.parsedJson.crown_height_to
    }else if(key == 'crown_angle_from'){
      return this.parsedJson.crown_angle_from
    }else if(key == 'crown_angle_to'){
      return this.parsedJson.crown_angle_to
    }else if(key == 'pavilion_depth_from'){
      return this.parsedJson.pavilion_depth_from
    }else if(key == 'pavilion_depth_to'){
      return this.parsedJson.pavilion_depth_to
    }else if(key == 'pavilion_angle_from'){
      return this.parsedJson.pavilion_angle_from
    }else if(key == 'girdle'){
      return this.parsedJson.girdle.toString()
    }else if(key == 'culet_size'){
      return this.parsedJson.culet_size.toString()
    }else if(key == 'culet_condition'){
      return this.parsedJson.culet_condition.toString()
    }else if(key == 'brands'){
      return this.parsedJson.brands.toString()
    }
  }

  searchBtn(item){
    this.step = 1
    let data = JSON.parse(item.body)
    this.search_saved_id = item.search_saved_id
    this.search_data = data
    this.searchdiamond()
  }


  editBtn(item){
    this.step = 1
    let data = JSON.parse(item.body)
    this.search_saved_id = item.search_saved_id
    this.search_data = data
  }

  modifyBtn(item){
    this.seraching_div = false
    console.log('item.body::::'+item.body)            //log
    let data = JSON.parse(item.body)
    this.search_saved_id = item.search_saved_id
    this.search_data = data
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
    }else if(field == 'company_code'){
      this.search_data['company_code'] = val
    }else if(field == 'rating'){
      this.search_data['rating'] = val
    }else if(field == 'specification'){
      if(this.search_data['specification'].includes(val)){
        this.search_data['specification'] = this.search_data['specification'].filter((e:any)=>e!=val)
      }else{
        this.search_data['specification'].push(val)
      }
    }else if(field == 'show_only'){
      if(this.search_data['show_only'].includes(val)){
        this.search_data['show_only'] = this.search_data['show_only'].filter((e:any)=>e!=val)
      }else{
        this.search_data['show_only'].push(val)
      }
    }else if(field == 'my_notes'){
      if(this.search_data['my_notes'].includes(val)){
        this.search_data['my_notes'] = this.search_data['my_notes'].filter((e:any)=>e!=val)
      }else{
        this.search_data['my_notes'].push(val)
      }
    }else if(field == 'media'){
      if(this.search_data['media'].includes(val)){
        this.search_data['media'] = this.search_data['media'].filter((e:any)=>e!=val)
      }else{
        this.search_data['media'].push(val)
      }
    }else if(field == 'preset_ratio'){
      this.search_data['preset_ratio'] = val
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
    }else if(field == 'brands'){
      if(this.search_data['brands'].includes(val)){
        this.search_data['brands'] = this.search_data['brands'].filter((e:any)=>e!=val)
      }else{
        this.search_data['brands'].push(val)
      }
    }else if(field == 'symbol_checkbox'){
      if(this.search_data['symbol_checkbox'].includes(val)){
        this.search_data['symbol_checkbox'] = this.search_data['symbol_checkbox'].filter((e:any)=>e!=val)
      }else{
        this.search_data['symbol_checkbox'].push(val)
      }
    }
  }

  searchreset(){
    this.search_data = {
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
    }
  }

  searchdiamond(){
    this.seraching_div = true
    this.search_datatableInit()
  }

  upload_submitted = false;
  uploadForm : FormGroup;
  upload_form(){
    this.uploadForm = this.formBuilder.group({
      stock_number: ['',[Validators.required]],
      asking_price: ['',[Validators.required]],
      asking_price_unit: ['CT',[Validators.required]],
      cash_price: ['',[Validators.required]],
      cash_price_unit: ['CT',[Validators.required]],
      availability: [''],
      country: [''],
      state: [''],
      city: [''],
      shape: ['',[Validators.required]],
      size: ['',[Validators.required]],
      color: ['',[Validators.required]],
      clarity: ['',[Validators.required]],
      cut: [''],
      polish: [''],
      symmetry: [''],
      fluor_intensity: [''],
      fluor_color: [''],
      meas_length: [''],
      meas_width: [''],
      meas_depth: [''],
      depth_percent: ['',[Validators.min(0), Validators.max(100)]],
      table_percent: ['',[Validators.min(0), Validators.max(100)]],
      crown_angle: [''],
      crown_height: [''],
      pavillion_angle: [''],
      pavillion_depth: [''],
      girdle_condition: [''],
      girdle_min: [''],
      girdle_max: [''],
      girdle_per: ['',[Validators.min(0), Validators.max(100)]],
      culet_condition: [''],
      culet_size: [''],
      treatment: [''],
      laser_inscription: [''],
      star_length: [''],
      lab: [''],
      report_number: [''],
      report_date: [''],
      lab_location: [''],
      report_comment: [''],
      symbols: [''],
      fancy_color_intensity: [''],
      fancy_color_overtone: [''],
      fancy_color_dominant_color: [''],
      fancy_color_secondary_color: [''],
      report_file: [''],
      diamond_img: [''],
      video_link: [''],
      sarine_loupe: [''],
      seller_spec: [''],
      shade: [''],
      milky: [''],
      eye_clean: [''],
      open_inclusions: [''],
      black_inclusions: [''],
      white_inclusions: [''],
    });
  }

  get fval() {
    return this.uploadForm.controls;
  }

  report_upload(evt) {
    if (evt.target) {
      this.Report_file = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.Report_img = this.Report_file.name;
      }
      reader.readAsDataURL(evt.target.files[0]);
    }
  }

  diamond_upload(evt) {
    if (evt.target) {
      this.Diamond_file = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.Diamond_img = this.Diamond_file.name;
      }
      reader.readAsDataURL(evt.target.files[0]);
    }
  }

  file_submitted = false;
  FileForm : FormGroup;
  report_upload_link = ''
  file_form() {
    this.FileForm = this.formBuilder.group({
      report_upload_link: ['',[Validators.required]],
    });
  }

  get fval1() {
    return this.FileForm.controls;
  }

  OnSubmitUpload(){
    this.file_submitted = true;
    if (this.FileForm.invalid) {
      return;
    }
    var data = this.FileForm.value;
    this.report_upload_link = data.report_upload_link
  }

  file_submitted1 = false;
  FileForm1 : FormGroup;
  diamond_upload_link ='';
  file_form1() {
    this.FileForm1 = this.formBuilder.group({
      diamond_upload_link: ['',[Validators.required]],
    });
  }

  get fval2() {
    return this.FileForm1.controls;
  }

  OnSubmitUpload1(){
    this.file_submitted1 = true;
    if (this.FileForm1.invalid) {
      return;
    }
    var data = this.FileForm1.value;
    this.diamond_upload_link = data.diamond_upload_link
  }

  onSubmitUpload(){
    this.upload_submitted = true;
    if (this.uploadForm.invalid) {
      return;
    }
    var data = this.uploadForm.value;
    var form_data  = new FormData()
    for ( var key in data ) {
      form_data.append(key, data[key]);
    }
    if(this.Report_file){
      form_data.append('report_file',this.Report_file)
    }else{
      form_data.append('report_upload_link',this.report_upload_link)
    }
    if(this.Diamond_file){
      form_data.append('diamond_img',this.Diamond_file)
    }else{
      form_data.append('diamond_upload_link',this.diamond_upload_link)
    }
    if(this.diamond_id){
      form_data.append('diamond_id',this.diamond_id)
    }
    if(this.userId){
      form_data.append('userId',this.userId)
    }
    this.http.PostAPI('users/uploadDiamonds', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.router.navigate(['diamonds']);
        this.step = 3
      } else {
        this.toastr.error(resdata.message);
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

  /*datatableInit(){
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.paginate,
      serverSide: true,
      responsive:true,
      searching:false,
      processing: true,
      order:[[0, 'desc']],
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters['search_saved_id'] = this.search_saved_id
        dataTablesParameters['search_data'] = this.search_data
        dataTablesParameters['userId'] = this.userId
        this.http.PostAPI('users/searchDiamonds',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.searchlist = resdata.response;
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
        //{ data: 'diamond_id',orderable:false,searchable:false},
        { data: 'diamond_id',orderable:false,searchable:false},
        { data: 'stock_number'},
        { data: 'shape'},
        { data: 'size'},
        { data: 'color'},
        { data: 'cut'},
        { data: 'polish'},
        { data: 'symmetry'},
        { data: 'created_at'},
        { data: 'status',orderable:false},
        { data: 'action',orderable:false}
      ]
    }
  }*/

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
        sessionStorage.setItem("searchData", JSON.stringify(this.search_data));

        dataTablesParameters['userId'] = this.userId
        this.http.PostAPI('users/searchDiamonds',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.AllDiamondList = []
            this.searchlistData = resdata.response;
            console.log("searchlistData::::" + JSON.stringify(this.searchlistData))        //log
            for(var i=0;i<this.searchlistData.length;i++) {
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
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      window.dispatchEvent(new Event('resize'));
    });
    window.dispatchEvent(new Event('resize'));
  }

  check_edit(step){
    this.step = parseInt(step)
    if(this.step == 4){
      this.upload_submitted = false
      this.upload_form()
    }
  }

  check_step(step){
    this.step = parseInt(step)
    if(this.step == 1){
      this.seraching_div = false
      this.searchreset()
    }
    if(this.step == 5){
      this.loadPage(1)
    }
  }

  SelectedSymbols;
  SelectedOpen;
  SelectedBlack;
  SelectedWhite;
  edit_diamond(diamond_id){
    this.diamond_id = diamond_id
    var data = {diamond_id:this.diamond_id}
    this.http.PostAPI('users/GetDiamonds', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.step = 4
        if(resdata.data.report_date == '0000-00-00'){
          resdata.data.report_date = ''
        }
        if(resdata.data.symbols != null){
          this.SelectedSymbols = resdata.data.symbols.split(",")
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
        this.Report_img = resdata.data.report_file
        this.Diamond_img = resdata.data.diamond_img
        this.uploadForm = this.formBuilder.group({
          stock_number: [resdata.data.stock_number,[Validators.required]],
          asking_price: [resdata.data.asking_price, [Validators.required]],
          asking_price_unit: [resdata.data.asking_price_unit, [Validators.required]],
          cash_price: [resdata.data.cash_price, [Validators.required]],
          cash_price_unit: [resdata.data.cash_price_unit, [Validators.required]],
          availability: [resdata.data.availability],
          country: [resdata.data.country],
          state: [resdata.data.state],
          city: [resdata.data.city],
          shape: [resdata.data.shape,[Validators.required]],
          size: [resdata.data.size,[Validators.required]],
          color: [resdata.data.color,[Validators.required]],
          clarity: [resdata.data.clarity,[Validators.required]],
          cut: [resdata.data.cut],
          polish: [resdata.data.polish],
          symmetry: [resdata.data.symmetry],
          fluor_intensity: [resdata.data.fluor_intensity],
          fluor_color: [resdata.data.fluor_color],
          meas_length: [resdata.data.meas_length],
          meas_width: [resdata.data.meas_width],
          meas_depth: [resdata.data.meas_depth],
          depth_percent: [resdata.data.depth_percent,[Validators.min(0), Validators.max(100)]],
          table_percent: [resdata.data.table_percent,[Validators.min(0), Validators.max(100)]],
          crown_angle: [resdata.data.crown_angle],
          crown_height: [resdata.data.crown_height],
          pavillion_angle: [resdata.data.pavillion_angle],
          pavillion_depth: [resdata.data.pavillion_depth],
          girdle_condition: [resdata.data.girdle_condition],
          girdle_min: [resdata.data.girdle_min],
          girdle_max: [resdata.data.girdle_max],
          girdle_per: [resdata.data.girdle_per,[Validators.min(0), Validators.max(100)]],
          culet_condition: [resdata.data.culet_condition],
          culet_size: [resdata.data.culet_size],
          treatment: [resdata.data.treatment],
          laser_inscription: [resdata.data.laser_inscription],
          star_length: [resdata.data.star_length],
          lab: [resdata.data.lab],
          report_number: [resdata.data.report_number],
          report_date: [resdata.data.report_date],
          lab_location: [resdata.data.lab_location],
          report_comment: [resdata.data.report_comment],
          symbols: [],
          fancy_color_intensity: [resdata.data.fancy_color_intensity],
          fancy_color_overtone: [resdata.data.fancy_color_overtone],
          fancy_color_dominant_color: [resdata.data.fancy_color_dominant_color],
          fancy_color_secondary_color: [resdata.data.fancy_color_secondary_color],
          report_file: [],
          diamond_img: [],
          video_link: [resdata.data.video_link],
          sarine_loupe: [resdata.data.sarine_loupe],
          seller_spec: [resdata.data.seller_spec],
          shade: [resdata.data.shade],
          milky: [resdata.data.milky],
          eye_clean: [resdata.data.eye_clean],
          open_inclusions: [],
          black_inclusions: [],
          white_inclusions: [],
        });
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  importfile_submitted = false;
  ImportForm : FormGroup;
  import_form() {
    this.ImportForm = this.formBuilder.group({
      selectoption: ['replace-all'],
      checkreportbymail: [''],
      sendreportbymail: ['']
    });
  }

  get fval3() {
    return this.ImportForm.controls;
  }

  public excel_data: any
  import_file_name = ''
  private arrayBuffer: string | ArrayBuffer;
  import_diamonds($event){
    this.excel_data = $event.target.files[0]
    if (this.excel_data.name.endsWith(".csv") == true) {
      // @ts-ignore
      Swal.fire({
        title: "",
        text: "",
        icon: 'warning',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Upload File',
        cancelButtonText: 'Cancel',
      }).then((willDelete) => {
        if (willDelete.value) {
          let fileReader = new FileReader();
          fileReader.onload = (e) => {
            this.arrayBuffer = fileReader.result;
            // @ts-ignore
            var data = new Uint8Array(this.arrayBuffer);
            var arr = new Array();
            for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            var bstr = arr.join("");
            //var workbook = XLSX.read(bstr,{ type: "buffer",encoding: 'utf-8' });
            var workbook = XLSX.read(bstr, {type: "binary", cellDates: true});
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            this.importData = JSON.stringify(XLSX.utils.sheet_to_json(worksheet, {raw: false, dateNF: 'dd/mm/yyyy'}))
            //data['data'] = JSON.stringify(XLSX.utils.sheet_to_json(worksheet, {raw: false, dateNF: 'dd/mm/yyyy'}))
            this.import_file_name = this.excel_data.name
          }
          fileReader.readAsArrayBuffer(this.excel_data);
        }
        return willDelete;
      });
    } else {
      Swal.fire(
        'Please valid for only CSV File',
        '',
        'error'
      )
    }
  }

  OnSubmitUploadImportFile(){
    this.importfile_submitted = true;
    if (this.ImportForm.invalid) {
      return;
    }
    var data = this.ImportForm.value;
    var form_data  = new FormData()
    for ( var key in data ) {
      form_data.append(key, data[key]);
    }
    if(this.importData != ''){
      form_data.append('importData', this.importData)
    }
    if(this.email){
      form_data.append('email', this.email)
    }
    if(this.userId){
      form_data.append('userId',this.userId)
    }
    this.http.PostAPI('users/importDiamonds', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.step = 3
        this.importData = ''
        this.importfile_submitted = false
        this.ReloadDatatable();
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  delete_diamond(data) {
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
        this.http.PostAPI('users/removeDiamond', data).then((resdata: any) => {
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

  change_status(diamond_id) {
    var data = { diamond_id: diamond_id }
    this.http.PostAPI('users/ChangeStatus', data).then((resdata: any) => {
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

  photoURL(name){
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

  fullURL(name){
    var pattern = /^((http|https|ftp):\/\/)/;
    if(pattern.test(name)) {
      return name;
    }else{
      return environment.backend_url+''+name;
    }
  }

  async download(url) {
    const a = document.createElement("a");
    a.href = await this.toDataURL(url);
    a.download = "download.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  deleteBtn(data) {
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
        this.http.PostAPI('users/removeSavedSearch', data).then((resdata: any) => {
          if (resdata.status == 200) {
            if(this.totalItems == 1){
              this.pageOfItems = []
            }
            this.loadPage(1);
            this.toastr.success(resdata.message);
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

  ParticularAddToWatchList(diamond){
    var messageWatchList = '';
    /*var diamond_id = parseInt(diamond);
    if (!this.DiamondList.includes(diamond_id)) {
      this.DiamondList.push(diamond_id);
    }else{
      const index1: number = this.DiamondList.indexOf(diamond_id);
      if (index1 !== -1) {
        this.DiamondList.splice(index1, 1);
      }
    }
    this.AddToWatchlist()*/
    var data1 = { userId: this.userId };
    this.http.PostAPI('users/watchlist', data1).then((resdata: any) => {
      if (resdata.status == 200) {
        this.DiamondWatchList =  resdata.WatchList.split(',').map(Number)

        const diamond_id = parseInt(diamond);
        if (!this.DiamondWatchList.includes(diamond_id)) {
          this.DiamondWatchList.push(diamond_id);
          messageWatchList = 'Add in WatchList Successfully.'
        }else{
          const index1: number = this.DiamondWatchList.indexOf(diamond_id);
          if (index1 !== -1) {
            messageWatchList = 'Remove From WatchList Successfully.'
            this.DiamondWatchList.splice(index1, 1);
          }
        }

        if(this.DiamondWatchList.length>0){
          var data = { watchListId: this.watchListId, userId: this.userId, diamondList: this.DiamondWatchList }
          this.http.PostAPI('users/AddToWatchList', data).then((resdata: any) => {
            if (resdata.status == 200) {
              this.toastr.success(messageWatchList);
            } else {
              this.toastr.error(messageWatchList);
            }
          }).catch((err) => {
            this.toastr.error(err);
          });
        }else{
          this.toastr.error('Please select any diamond');
        }
      } else {
        this.toastr.error(resdata.message)
      }
    }).catch((err) => {
      this.toastr.error(err);
    });

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

  sessionStore() {
    this.search_data = JSON.parse(sessionStorage.getItem('searchData'));
    sessionStorage.setItem('DiamondsDetailSession', 'false');
    this.searchdiamond();
  }

}
