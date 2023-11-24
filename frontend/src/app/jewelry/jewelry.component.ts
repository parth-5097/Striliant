import {Component, OnInit, ViewChild} from '@angular/core';
import { Select2OptionData } from 'ng-Select2';
import { Options } from 'select2';
import {Router, CanActivate} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {HttpService} from "../services/http.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {DataTableDirective} from "angular-datatables";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx/dist/xlsx.js';

@Component({
  selector: 'app-jewelry',
  templateUrl: './jewelry.component.html',
  styleUrls: ['./jewelry.component.css']
})
export class JewelryComponent implements OnInit {

  email = ''
  filesToUpload:Array<File> = [];
  images = []
  jewelry_submitted:boolean = false;
  jewelryForm: FormGroup;
  public Tags: Array<Select2OptionData>;
  public options1: Options;
  jewelry_id = ''
  step:number=1
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  jewelrylist:any[]=[];
  search_data:{} = {
    search_text:'',
    jewelry_type:[],
    jewelry_collection:[],
    jewelry_material:[],
    jewelry_stone_type:[],
    jewelry_style:[],
    jewelry_brand:[],
    jewelry_location:[],
    jewelry_condition:[],
    jewelry_state:[],
  }
  SelectedTags;
  jewelry_images = []
  backend_url = ''
  frontend_url = ''
  importData = ''

  constructor(public router: Router, public toastr: ToastrService, public http: HttpService, private formBuilder: FormBuilder) {
    if(localStorage.getItem('User')){
      let CurrentUser = JSON.parse(localStorage.getItem('User'));
      this.email = CurrentUser.email;
    }
  }

  ngOnInit(): void {
    this.backend_url = this.http.backendurl
    this.frontend_url = this.http.frontendurl
    this.ValidationJewelryForm()
    this.Tags = [];
    this.options1 = {
      width: '450',
      multiple: true,
      tags: true
    };
    this.datatableInit()
    this.import_form()
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
      responsive:true,
      searching:false,
      processing: true,
      order:[[0, 'desc']],
      scrollX:true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters['search_data'] = this.search_data
        this.http.PostAPI('users/searchJewelry',dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.jewelrylist = resdata.response;
          } else {
            this.jewelrylist = [];
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
          this.jewelrylist = [];
          callback({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
          })
        })
      },
      columns: [
        { data: 'jewelry_id',orderable:false,searchable:false},
        { data: 'jewelry_id'},
        { data: 'jewelry_stock_number'},
        { data: 'created_at'},
        { data: 'jewelry_title'},
        { data: 'jewelry_price'},
        { data: 'jewelry_quantity'},
        { data: 'jewelry_type'},
        { data: 'jewelry_location'},
        { data: 'status',orderable:false},
        { data: 'action',orderable:false}
      ]
    }
  }

  isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }

  ValidationJewelryForm(){
    this.jewelryForm = this.formBuilder.group({
      jewelry_video_link: [""],
      jewelry_title: ["",[Validators.required]],
      jewelry_stock_number: ["", [Validators.required]],
      jewelry_description: ["",[Validators.required]],
      jewelry_price: ["",[Validators.required]],
      jewelry_msrp: [""],
      jewelry_memo: [""],
      jewelry_quantity: [""],
      jewelry_minimum_order: [""],
      jewelry_out_of_stock: [""],
      jewelry_type: ["", [Validators.required]],
      jewelry_condition: [""],
      jewelry_state: [""],
      jewelry_collection: [""],
      jewelry_style: [""],
      jewelry_material: [""],
      jewelry_material_weight: [""],
      jewelry_material_karat: [""],
      jewelry_stone_type: [""],
      jewelry_brand: [""],
      jewelry_design: [""],
      jewelry_location: ["", [Validators.required]],
      jewelry_currency: [""],
      jewelry_lab: [""],
      jewelry_certificate: [""],
      jewelry_parent_stock_number: [""],
      jewelry_manufacture_date: [""],
      jewelry_total_length: [""],
      jewelry_total_width_mm: [""],
      jewelry_total_width_gr: [""],
      jewelry_tags: [""],
      jewelry_upload_own_stock: [""],
    });
  }

  timer: any = "";
  filterById(e:any) {
    this.search_data['search_cert'] = e
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

  jewelry_img(event) {
    if (event.target.files && event.target.files[0]) {
      this.filesToUpload.push(event.target.files[0]);
      var filesAmount = event.target.files.length;
      for (let i = 0; i < filesAmount; i++) {
        var reader = new FileReader();
        reader.onload = (event:any) => {
          this.images.push(event.target.result);
        }
        reader.readAsDataURL(event.target.files[i]);
      }
    }
  }

  removeimgefromarray(index){
    var new_arr = [];
    for (let i = 0; i < this.images.length; i++)
    {
      if(i!=index)
      {
        new_arr.push(this.images[i]);
      }
    }
    this.images = new_arr;
    this.filesToUpload = new_arr
  }

  get f() { return this.jewelryForm.controls; }

  onSubmitJewelry(){
    this.jewelry_submitted = true
    if(this.jewelryForm.invalid) {
      return;
    }
    var data = this.jewelryForm.value;
    var formData = new FormData();
    for ( var key in data ) {
      formData.append(key, data[key]);
    }
    if(this.jewelry_id != undefined || this.jewelry_id != null ){
      formData.append('jewelry_id', this.jewelry_id);
    }
    if(this.filesToUpload){
      var files = this.filesToUpload;
      for(let i =0; i < files.length; i++){
        formData.append('jewelry_images', files[i]);
      }
    }
    this.http.PostAPI('users/uploadJewelry', formData).then((resdata: any) => {
      if (resdata.status == 200) {
        this.step = 2
        this.images = []
        this.filesToUpload = []
        this.jewelry_images = []
        this.jewelry_id = ''
        this.jewelry_submitted = false
        this.ValidationJewelryForm()
        this.toastr.success(resdata.message);
      }else{
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  check_edit(step){
    this.step = parseInt(step)
    if(this.step == 3){
      this.images = []
      this.filesToUpload = []
      this.jewelry_images = []
      this.jewelry_id = ''
      this.jewelry_submitted = false
      this.ValidationJewelryForm()
    }
  }

  edit_jewelry(jewelry_id){
    this.jewelry_id = jewelry_id
    var data = {jewelry_id:this.jewelry_id}
    this.http.PostAPI('users/GetJewelry', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.step = 3
        if(resdata.data.jewelry_manufacture_date == '0000-00-00'){
          resdata.data.jewelry_manufacture_date = ''
        }
        if(resdata.data.jewelry_tags != null){
          this.Tags = resdata.data.jewelry_tags.split(",")
          this.SelectedTags = resdata.data.jewelry_tags.split(",")
        }
        if(resdata.data.jewelry_images != null && resdata.data.jewelry_images != ''){
          this.jewelry_images = resdata.data.jewelry_images.split(",")
        }else{
          this.jewelry_images = []
        }
        this.jewelryForm = this.formBuilder.group({
          jewelry_video_link: [resdata.data.jewelry_video_link],
          jewelry_title: [resdata.data.jewelry_title,[Validators.required]],
          jewelry_stock_number: [resdata.data.jewelry_stock_number, [Validators.required]],
          jewelry_description: [resdata.data.jewelry_description,[Validators.required]],
          jewelry_price: [resdata.data.jewelry_price,[Validators.required]],
          jewelry_msrp: [resdata.data.jewelry_msrp],
          jewelry_memo: [resdata.data.jewelry_memo],
          jewelry_quantity: [resdata.data.jewelry_quantity],
          jewelry_minimum_order: [resdata.data.jewelry_minimum_order],
          jewelry_out_of_stock: [resdata.data.jewelry_out_of_stock],
          jewelry_type: [resdata.data.jewelry_type, [Validators.required]],
          jewelry_condition: [resdata.data.jewelry_condition],
          jewelry_state: [resdata.data.jewelry_state],
          jewelry_collection: [resdata.data.jewelry_collection],
          jewelry_style: [resdata.data.jewelry_style],
          jewelry_material: [resdata.data.jewelry_material],
          jewelry_material_weight: [resdata.data.jewelry_material_weight],
          jewelry_material_karat: [resdata.data.jewelry_material_karat],
          jewelry_stone_type: [resdata.data.jewelry_stone_type],
          jewelry_brand: [resdata.data.jewelry_brand],
          jewelry_design: [resdata.data.jewelry_design],
          jewelry_location: [resdata.data.jewelry_location, [Validators.required]],
          jewelry_currency: [resdata.data.jewelry_currency],
          jewelry_lab: [resdata.data.jewelry_lab],
          jewelry_certificate: [resdata.data.jewelry_certificate],
          jewelry_parent_stock_number: [resdata.data.jewelry_parent_stock_number],
          jewelry_manufacture_date: [resdata.data.jewelry_manufacture_date],
          jewelry_total_length: [resdata.data.jewelry_total_length],
          jewelry_total_width_mm: [resdata.data.jewelry_total_width_mm],
          jewelry_total_width_gr: [resdata.data.jewelry_total_width_gr],
          jewelry_tags: [resdata.data.jewelry_tags],
          jewelry_upload_own_stock: [resdata.data.jewelry_upload_own_stock],
        });
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  delete_jewelry(data) {
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
        this.http.PostAPI('users/removeJewelry', data).then((resdata: any) => {
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

  change_status(jewelry_id) {
    var data = { jewelry_id: jewelry_id }
    this.http.PostAPI('users/ChangeStatusJewelry', data).then((resdata: any) => {
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

  deletefile(url){
    var data = { url:url,jewelry_id:this.jewelry_id }
    this.http.PostAPI('users/jewelryRemoveImage', data).then((response: any) => {
      if (response.status == 200) {
        this.toastr.success(response.message);
        this.edit_jewelry(this.jewelry_id)
        this.ReloadDatatable()
      } else {
        this.toastr.error(response.message);
      }
    }).catch((err) => {
      this.toastr.error('System error. try again later.');
    });
  }

  importfile_submitted = false;
  ImportForm : FormGroup;
  import_form() {
    this.ImportForm = this.formBuilder.group({
      jewelry_upload_own_stock: []
    });
  }

  get fval3() {
    return this.ImportForm.controls;
  }

  public excel_data: any
  import_file_name = ''
  private arrayBuffer: string | ArrayBuffer;
  import_jewelry($event){
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
    this.http.PostAPI('users/importJewelry', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.step = 2
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

  searchselect(val:any,field:string){
    if(field == 'search_text'){
      this.search_data['search_text'] = val
    }else if(field == 'jewelry_type'){
      if(this.search_data['jewelry_type'].includes(val)){
        this.search_data['jewelry_type'] = this.search_data['jewelry_type'].filter((e:any)=>e!=val)
      }else{
        this.search_data['jewelry_type'].push(val)
      }
    }else if(field == 'jewelry_collection'){
      if(this.search_data['jewelry_collection'].includes(val)){
        this.search_data['jewelry_collection'] = this.search_data['jewelry_collection'].filter((e:any)=>e!=val)
      }else{
        this.search_data['jewelry_collection'].push(val)
      }
    }else if(field == 'jewelry_material'){
      if(this.search_data['jewelry_material'].includes(val)){
        this.search_data['jewelry_material'] = this.search_data['jewelry_material'].filter((e:any)=>e!=val)
      }else{
        this.search_data['jewelry_material'].push(val)
      }
    }else if(field == 'jewelry_stone_type'){
      if(this.search_data['jewelry_stone_type'].includes(val)){
        this.search_data['jewelry_stone_type'] = this.search_data['jewelry_stone_type'].filter((e:any)=>e!=val)
      }else{
        this.search_data['jewelry_stone_type'].push(val)
      }
    }else if(field == 'jewelry_style'){
      if(this.search_data['jewelry_style'].includes(val)){
        this.search_data['jewelry_style'] = this.search_data['jewelry_style'].filter((e:any)=>e!=val)
      }else{
        this.search_data['jewelry_style'].push(val)
      }
    }else if(field == 'jewelry_brand'){
      if(this.search_data['jewelry_brand'].includes(val)){
        this.search_data['jewelry_brand'] = this.search_data['jewelry_brand'].filter((e:any)=>e!=val)
      }else{
        this.search_data['jewelry_brand'].push(val)
      }
    }else if(field == 'jewelry_location'){
      if(this.search_data['jewelry_location'].includes(val)){
        this.search_data['jewelry_location'] = this.search_data['jewelry_location'].filter((e:any)=>e!=val)
      }else{
        this.search_data['jewelry_location'].push(val)
      }
    }else if(field == 'jewelry_condition'){
      if(this.search_data['jewelry_condition'].includes(val)){
        this.search_data['jewelry_condition'] = this.search_data['jewelry_condition'].filter((e:any)=>e!=val)
      }else{
        this.search_data['jewelry_condition'].push(val)
      }
    }else if(field == 'jewelry_state'){
      if(this.search_data['jewelry_state'].includes(val)){
        this.search_data['jewelry_state'] = this.search_data['jewelry_state'].filter((e:any)=>e!=val)
      }else{
        this.search_data['jewelry_state'].push(val)
      }
    }
    this.getSearchJewelryData()
  }

  searchreset(){
    this.search_data = {
      search_text:'',
      jewelry_type:[],
      jewelry_collection:[],
      jewelry_material:[],
      jewelry_stone_type:[],
      jewelry_style:[],
      jewelry_brand:[],
      jewelry_location:[],
      jewelry_condition:[],
      jewelry_state:[],
    }
  }

  getSearchJewelryData(){
    var data = { search_data: this.search_data }
    this.http.PostAPI('users/GetSearchJewelry', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
      } else {
        this.toastr.error(resdata.message)
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
