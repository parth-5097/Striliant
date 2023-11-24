import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {AdminHttpService} from '../../services/admin-http.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DataTableDirective} from 'angular-datatables';
import {environment} from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx/dist/xlsx.js';
import {ngxCsv} from 'ngx-csv';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-admin-diamonds',
  templateUrl: './admin-diamonds.component.html',
  styleUrls: ['./admin-diamonds.component.css']
})
export class AdminDiamondsComponent implements AfterViewInit, OnDestroy, OnInit {

  show_model = false;
  adminId = '';
  extendid: any = 0;
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  searchlist: any[] = [];
  search_data: {} = {
    shape_basic: '',
    shape_advanced: [],
    size_general_from: '',
    size_general_to: '',
    size_specific: [],
    color_fancy: [],
    color_white_intensity_from: '',
    color_white_intensity_to: '',
    color_white_overtone: '',
    color_white_color: '',
    clarity: [],
    finish_general_cut_from: '',
    finish_general_cut_to: '',
    finish_general_polish_from: '',
    finish_general_polish_to: '',
    finish_general_symmetry_from: '',
    finish_general_symmetry_to: '',
    finish_specific: [],
    fluorescence_intensity: [],
    grading_report: [],
    location: [],
    flexible_delivery: '',
    company_code: '',
    rating: '',
    stock_number: '',
    lot_number: '',
    specification: [],
    price_ct_from: '',
    price_ct_to: '',
    price_total_from: '',
    price_total_to: '',
    price_rap_from: '',
    price_rap_to: '',
    show_only: [],
    my_notes: [],
    media: [],
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
    brands: [],
    category_code: '',
    lab_report_number: '',
    access_code: '',
    symbol_checkbox: []
  };
  diamond_type = '';
  isMasterChecked = false;
  DiamondList = [];
  constructor(private sanitizer: DomSanitizer, public router: Router, public toastr: ToastrService, public adminhttp: AdminHttpService, private formBuilder: FormBuilder) {
    if(localStorage.getItem('Admin')){
      let CurrentAdmin = JSON.parse(localStorage.getItem('Admin'));
      this.adminId = CurrentAdmin.adminId;
    }
  }

  ngOnInit(): void {
    this.datatableInit();
    this.import_form();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  change_type(val){
    this.diamond_type = val;
    this.filterById();
    this.rerender();
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
    this.searchlist = [];
    this.extendid = 0;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      language: this.paginate,
      serverSide: true,
      responsive: false,
      searching: false,
      processing: true,
      order: [[4, 'desc']],
      scrollX: true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters.diamond_type = this.diamond_type;
        dataTablesParameters.search_data = this.search_data;
        this.adminhttp.PostAPI('admin/searchDiamonds', dataTablesParameters).then((resdata: any) => {
          if (resdata.status == 200) {
            this.searchlist = resdata.response;
          } else {
            this.searchlist = [];
            resdata.TotalRecords.cnt = 0;
          }
          callback({
            recordsTotal: resdata.TotalRecords.cnt,
            recordsFiltered: resdata.TotalRecords.cnt,
            data: []
          });
        }).catch((err) => {
          if (err.error == 'Unauthorized') {
            this.adminhttp.logout();
          }
          this.searchlist = [];
          callback({
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
          });
        });
      },
      columns: [
        { data: 'diamond_id', orderable: false, searchable: false},
        { data: 'diamond_id', orderable: false, searchable: false},
        { data: 'action', orderable: false, searchable: false},
        { data: 'status', orderable: false, searchable: false},
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
    };
    setTimeout(() => {
      this.rerender();
    }, 3500);
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
    window.dispatchEvent(new Event('resize'));
  }

  featured_stone(diamond_id){
    var data = { diamond_id: diamond_id };
    this.adminhttp.PostAPI('users/FeaturedStoneChangeStatus', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.ReloadDatatable();
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  change_status(diamond_id) {
    var data = { diamond_id: diamond_id };
    this.adminhttp.PostAPI('users/ChangeStatus', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.ReloadDatatable();
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  photoURL(name) {
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

  async download(url) {
    const a = document.createElement('a');
    a.href = await this.toDataURL(url);
    a.download = 'download.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  fullURL(name){
    var pattern = /^((http|https|ftp):\/\/)/;
    if (pattern.test(name)) {
      return name;
    }else{
      return environment.backend_url + '' + name;
    }
  }

  delete_diamond(data) {
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
        this.adminhttp.PostAPI('admin/removeDiamond', data).then((resdata: any) => {
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

  importfile_submitted = false;
  ImportForm: FormGroup;
  import_form() {
    this.ImportForm = this.formBuilder.group({
      import_file: ['', [Validators.required]],
      selectoption: ['replace-all']
    });
  }

  open_model(){
    this.show_model = true;
    this.import_form();
  }

  close_model(){
    this.show_model = false;
    this.ImportForm.reset();
  }

  get fval3() {
    return this.ImportForm.controls;
  }

  public excel_data: any;
  importData = '';
  private arrayBuffer: string | ArrayBuffer;
  import_diamonds($event){
    this.excel_data = $event.target.files[0]
    if (this.excel_data.name.endsWith('.csv') == true) {
      // @ts-ignore
      Swal.fire({
        title: '',
        text: '',
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
            var bstr = arr.join('');
            // var workbook = XLSX.read(bstr,{ type: 'buffer',encoding: 'utf-8' });
            var workbook = XLSX.read(bstr, {type: 'binary', cellDates: true});
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            this.importData = JSON.stringify(XLSX.utils.sheet_to_json(worksheet, {raw: false, dateNF: 'dd/mm/yyyy'}))
          };
          fileReader.readAsArrayBuffer(this.excel_data);
        }
        return willDelete;
      });
    } else {
      Swal.fire(
        'Please valid for only CSV File',
        '',
        'error'
      );
    }
  }

  OnSubmitUploadImportFile(){
    this.importfile_submitted = true;
    if (this.ImportForm.invalid) {
      return;
    }
    var data = this.ImportForm.value;
    var form_data  = new FormData();
    for ( var key in data ) {
      form_data.append(key, data[key]);
    }
    if (this.importData != ''){
      form_data.append('importData', this.importData);
    }
    if (this.adminId){
      form_data.append('adminId', this.adminId);
    }
    this.adminhttp.PostAPI('admin/importDiamonds', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.close_model();
        this.importData = '';
        this.importfile_submitted = false;
        this.ReloadDatatable();
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  export_csv() {
    var data = {};
    this.adminhttp.PostAPI('admin/ExportDiamonds', data).then((resdata: any) => {
      if (resdata.status == 200) {
        var options = {
          title: 'Diamonds Sheet',
          fieldSeparator: ',',
          quoteStrings: '"',
          decimalseparator: '.',
          showLabels: true,
          showTitle: false,
          useBom: true,
          headers: [
            'ID',
            'Vendor Name',
            'Vendor ID',
            'Vendor Email',
            'Vendor Stock ID',
            'Type',
            'Stock Number',
            'Rap Price',
            'Vendor Back',
            'Vendor Price Back',
            'Vendor Subtotal',
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
    if (this.isMasterChecked == false){
      this.isMasterChecked = true;
      for(var i = 0; i < this.searchlist.length; i++){
        var diamond_id = parseInt(this.searchlist[i].diamond_id);
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
      this.isMasterChecked = false;
      this.DiamondList = [];
    }
  }

  checkboxSelect(diamond){
    var diamond_id = parseInt(diamond);
    if (!this.DiamondList.includes(diamond_id)) {
      this.DiamondList.push(diamond_id);
    }else{
      const index1: number = this.DiamondList.indexOf(diamond_id);
      if (index1 !== -1) {
        this.DiamondList.splice(index1, 1);
      }
    }
  }

  selected_remove(){
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
        var data = {DiamondList : this.DiamondList};
        this.adminhttp.PostAPI('admin/removeSelectedDiamond', data).then((resdata: any) => {
          if (resdata.status == 200) {
            this.toastr.success(resdata.message);
            this.DiamondList = [];
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

}
