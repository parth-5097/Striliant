import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {ToastrService} from "ngx-toastr";
import {HttpService} from "../services/http.service";
import { DataTableDirective } from 'angular-datatables';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx/dist/xlsx.js';

@Component({
  selector: 'app-search-diamonds',
  templateUrl: './search-diamonds.component.html',
  styleUrls: ['./search-diamonds.component.css']
})
export class SearchDiamondsComponent implements OnInit {
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  searchlist:any[]=[];
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

  constructor(public router: Router, public toastr: ToastrService, public http: HttpService, private activatedRoute: ActivatedRoute) {
    var obj:any=''
    this.activatedRoute.queryParams.subscribe(params => {
      obj = params;
    });
    this.search_data = JSON.parse(obj['search'])
    http.searchdata = this.search_data;
  }

  ngOnInit(): void {
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
      pageLength: 50,
      language: this.paginate,
      serverSide: true,
      responsive:true,
      searching:false,
      processing: true,
      order:[[0, 'desc']],
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters['search_data'] = this.search_data
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
        { data: 'diamond_id',orderable:false,searchable:false},
        { data: 'diamond_id'},
        { data: 'stock_number'},
        { data: 'created_at'},
        { data: 'asking_price'},
        { data: 'cash_price'},
        { data: 'shape'},
        { data: 'size'},
        { data: 'color'},
        { data: 'clarity'},
        { data: 'status',orderable:false},
        { data: 'action',orderable:false}
      ]
    }
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


}
