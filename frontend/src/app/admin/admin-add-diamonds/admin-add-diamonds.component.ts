import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {Select2OptionData} from "ng-select2";
import { Options } from 'select2';
import { Location } from '@angular/common';

@Component({
  selector: 'app-admin-add-diamonds',
  templateUrl: './admin-add-diamonds.component.html',
  styleUrls: ['./admin-add-diamonds.component.css']
})
export class AdminAddDiamondsComponent implements OnInit {

  public locationData: Array<Select2OptionData>;
  public options: Options;
  upload_submitted = false;
  uploadForm : FormGroup;
  Report_file: File;
  Diamond_file: File;
  Video_file: File;
  Report_img=''
  Diamond_img=''
  Video_img=''
  Symbols = []
  Open_Inclusions = []
  Black_Inclusions = []
  White_Inclusions = []
  Brands = []
  frontend_url = ''
  SelectedSymbols;
  SelectedOpen;
  SelectedBlack;
  SelectedWhite;
  SelectedBrands;
  diamond_id = ''
  adminId = ''
  title = 'Add'
  show_model = false
  show_model1 = false
  show_model2 = false
  constructor(public router: Router, public toastr: ToastrService, public adminhttp: AdminHttpService, private formBuilder: FormBuilder, private route: ActivatedRoute, private location: Location) {
    if(localStorage.getItem('Admin')){
      let CurrentAdmin = JSON.parse(localStorage.getItem('Admin'));
      this.adminId = CurrentAdmin.adminId;
    }
  }

  ngOnInit(): void {
    const diamond_id = this.route.snapshot.paramMap.get('diamond_id');
    this.diamond_id = diamond_id;
    this.frontend_url = this.adminhttp.frontendurl
    this.Symbols = [
      {
        id:"NON",
        text:"None"
      },
      {
        id:"Bearding",
        text:"Bearding"
      },
      {
        id:"Brown patch of color",
        text:"Brown patch of color"
      },
      {
        id:"Bruise",
        text:"Bruise"
      },
      {
        id:"Cavity",
        text:"Cavity"
      },
      {
        id:"Chip",
        text:"Chip"
      },
      {
        id:"Cleavage",
        text:"Cleavage"
      },
      {
        id:"Cloud",
        text:"Cloud"
      },
      {
        id:"Crystal",
        text:"Crystal"
      },
      {
        id:"Crystal Surface",
        text:"Crystal Surface"
      },
      {
        id:"Etch Channel",
        text:"Etch Channel"
      },
      {
        id:"Extra Facet",
        text:"Extra Facet"
      },
      {
        id:"Feather",
        text:"Feather"
      },
      {
        id:"Flux Remnant",
        text:"Flux Remnant"
      },
      {
        id:"Indented Natural",
        text:"Indented Natural"
      },
      {
        id:"Internal Graining",
        text:"Internal Graining"
      },
      {
        id:"Internal Inscription",
        text:"Internal Inscription"
      },
      {
        id:"Internal Laser Drilling",
        text:"Internal Laser Drilling"
      },
      {
        id:"Knot",
        text:"Knot"
      },
      {
        id:"Laser Drill Hole",
        text:"Laser Drill Hole"
      },
      {
        id:"Manufacturing Remnant",
        text:"Manufacturing Remnant"
      },
      {
        id:"Minor Details of Polish",
        text:"Minor Details of Polish"
      },
      {
        id:"Natural",
        text:"Natural"
      },
      {
        id:"Needle",
        text:"Needle"
      },
      {
        id:"No Inclusion",
        text:"No Inclusion"
      },
      {
        id:"Pinpoint",
        text:"Pinpoint"
      },
      {
        id:"Reflecting Surface Graining",
        text:"Reflecting Surface Graining"
      },
      {
        id:"Surface Graining",
        text:"Surface Graining"
      },
      {
        id:"Twinning Wisp",
        text:"Twinning Wisp"
      }
    ];
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
    this.Brands = [
      {
        id: "Hearts and Arrows",
        text: "Hearts and Arrows"
      },
      {
        id: "88-Cut",
        text: "88-Cut"
      },
      {
        id: "Arctic Fox",
        text: "Arctic Fox"
      },
      {
        id: "Argyle",
        text: "Argyle"
      },
      {
        id: "Canada Mark",
        text: "Canada Mark"
      },
      {
        id: "Canadian Ice",
        text: "Canadian Ice"
      },
      {
        id: "Heart On Fire",
        text: "Heart's On Fire"
      },
      {
        id: "Polar Bear",
        text: "Polar Bear"
      },
      {
        id: "Polar Ice",
        text: "Polar Ice"
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
      width: 410,
      multiple: true
    };
    if(this.diamond_id){
      this.title = 'Edit'
      this.get_data()
    }
    this.upload_form()
    this.file_form()
    this.file_form1()
    this.file_form2()
  }

  cancel() {
    this.location.back();
  }

  upload_form(){
    this.uploadForm = this.formBuilder.group({
      vendor_name: ['',[Validators.required]],
      vendor_id: ['',[Validators.required]],
      vendor_email: ['',[Validators.required, Validators.email]],
      vendor_stock_id: ['',[Validators.required]],
      diamond_type: ['Natural',[Validators.required]],
      stock_number: ['',[Validators.required]],
      rap_price: ['',[Validators.required]],
      vendor_back: ['',[Validators.required]],
      sale_back: ['',[Validators.required]],
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
      sarine_loupe: [''],
      seller_spec: [''],
      shade: [''],
      milky: [''],
      eye_clean: [''],
      open_inclusions: [''],
      black_inclusions: [''],
      white_inclusions: [''],
      brands: [''],
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
        this.report_upload_link = ''
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
        this.diamond_upload_link = ''
        this.Diamond_img = this.Diamond_file.name;
      }
      reader.readAsDataURL(evt.target.files[0]);
    }
  }

  video_upload(evt) {
    if (evt.target) {
      this.Video_file = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = (event: any) => {
        this.video_link = ''
        this.Video_img = this.Video_file.name;
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
    this.Report_img = ''
    this.report_upload_link = data.report_upload_link
    this.close_model()
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
    this.Diamond_img = ''
    this.diamond_upload_link = data.diamond_upload_link
    this.close_model1()
  }

  file_submitted2 = false;
  FileForm2 : FormGroup;
  video_link ='';
  file_form2() {
    this.FileForm2 = this.formBuilder.group({
      video_link: ['',[Validators.required]],
    });
  }

  get fval3() {
    return this.FileForm2.controls;
  }

  OnSubmitUpload2(){
    this.file_submitted2 = true;
    if (this.FileForm2.invalid) {
      return;
    }
    var data = this.FileForm2.value;
    this.Video_img = ''
    this.video_link = data.video_link
    this.close_model1()
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
    if(this.Video_file){
      form_data.append('video_file',this.Video_file)
    }else{
      form_data.append('video_link',this.video_link)
    }
    if(this.diamond_id){
      form_data.append('diamond_id',this.diamond_id)
    }
    if(this.adminId){
      form_data.append('adminId',this.adminId)
    }
    this.adminhttp.PostAPI('admin/uploadDiamonds', form_data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.toastr.success(resdata.message);
        this.router.navigate(['admin/diamonds']);
      } else {
        this.toastr.error(resdata.message);
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

  get_data(){
    var data = {diamond_id:this.diamond_id}
    this.adminhttp.PostAPI('admin/GetDiamonds', data).then((resdata: any) => {
      if (resdata.status == 200) {
        if(resdata.data.country == null){
          resdata.data.country = ''
        }
        if(resdata.data.state == null){
          resdata.data.state = ''
        }
        if(resdata.data.city == null){
          resdata.data.city = ''
        }
        if(resdata.data.availability == null){
          resdata.data.availability = ''
        }
        if(resdata.data.cut == null){
          resdata.data.cut = ''
        }
        if(resdata.data.polish == null){
          resdata.data.polish = ''
        }
        if(resdata.data.symmetry == null){
          resdata.data.symmetry = ''
        }
        if(resdata.data.fluor_intensity == null){
          resdata.data.fluor_intensity = ''
        }
        if(resdata.data.fluor_color == null){
          resdata.data.fluor_color = ''
        }
        if(resdata.data.girdle_condition == null){
          resdata.data.girdle_condition = ''
        }
        if(resdata.data.girdle_min == null){
          resdata.data.girdle_min = ''
        }
        if(resdata.data.girdle_max == null){
          resdata.data.girdle_max = ''
        }
        if(resdata.data.culet_condition == null){
          resdata.data.culet_condition = ''
        }
        if(resdata.data.culet_size == null){
          resdata.data.culet_size = ''
        }
        if(resdata.data.treatment == null){
          resdata.data.treatment = ''
        }
        if(resdata.data.laser_inscription == null){
          resdata.data.laser_inscription = ''
        }
        if(resdata.data.lab == null){
          resdata.data.lab = ''
        }
        if(resdata.data.lab_location == null){
          resdata.data.lab_location = ''
        }
        if(resdata.data.sarine_loupe == null){
          resdata.data.sarine_loupe = ''
        }
        if(resdata.data.video_link == null){
          resdata.data.video_link = ''
        }
        if(resdata.data.seller_spec == null){
          resdata.data.seller_spec = ''
        }
        if(resdata.data.fancy_color_intensity == null){
          resdata.data.fancy_color_intensity = ''
        }
        if(resdata.data.fancy_color_overtone == null){
          resdata.data.fancy_color_overtone = ''
        }
        if(resdata.data.fancy_color_dominant_color == null){
          resdata.data.fancy_color_dominant_color = ''
        }
        if(resdata.data.fancy_color_secondary_color == null){
          resdata.data.fancy_color_secondary_color = ''
        }
        if(resdata.data.shade == null){
          resdata.data.shade = ''
        }
        if(resdata.data.milky == null){
          resdata.data.milky = ''
        }
        if(resdata.data.eye_clean == null){
          resdata.data.eye_clean = ''
        }
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
        if(resdata.data.brands != null){
          this.SelectedBrands = resdata.data.brands.split(",")
        }
        if(resdata.data.meas_length == 0){
          resdata.data.meas_length = ''
        }
        if(resdata.data.meas_width == 0){
          resdata.data.meas_width = ''
        }
        if(resdata.data.meas_depth == 0){
          resdata.data.meas_depth = ''
        }
        if(resdata.data.depth_percent == 0){
          resdata.data.depth_percent = ''
        }
        if(resdata.data.table_percent == 0){
          resdata.data.table_percent = ''
        }
        if(resdata.data.crown_angle == 0){
          resdata.data.crown_angle = ''
        }
        if(resdata.data.crown_height == 0){
          resdata.data.crown_height = ''
        }
        if(resdata.data.pavillion_angle == 0){
          resdata.data.pavillion_angle = ''
        }
        if(resdata.data.pavillion_depth == 0){
          resdata.data.pavillion_depth = ''
        }
        if(resdata.data.girdle_per == 0){
          resdata.data.girdle_per = ''
        }
        if(resdata.data.star_length == 0){
          resdata.data.star_length = ''
        }
        if(resdata.data.report_number == 0){
          resdata.data.report_number = ''
        }
        this.Report_img = resdata.data.report_file
        this.Diamond_img = resdata.data.diamond_img
        this.Video_img = resdata.data.video_link
        this.uploadForm = this.formBuilder.group({
          vendor_name: [resdata.data.vendor_name,[Validators.required]],
          vendor_id: [resdata.data.vendor_id,[Validators.required]],
          vendor_email: [resdata.data.vendor_email,[Validators.required]],
          vendor_stock_id: [resdata.data.vendor_stock_id,[Validators.required]],
          diamond_type: [resdata.data.diamond_type,[Validators.required]],
          stock_number: [resdata.data.stock_number,[Validators.required]],
          rap_price: [resdata.data.rap_price,[Validators.required]],
          vendor_back: [resdata.data.vendor_back,[Validators.required]],
          sale_back: [resdata.data.sale_back,[Validators.required]],
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
          sarine_loupe: [resdata.data.sarine_loupe],
          seller_spec: [resdata.data.seller_spec],
          shade: [resdata.data.shade],
          milky: [resdata.data.milky],
          eye_clean: [resdata.data.eye_clean],
          open_inclusions: [],
          black_inclusions: [],
          white_inclusions: [],
          brands: [],
        });
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  open_upload_link(){
    this.show_model = true
  }

  open_upload_link1(){
    this.show_model1 = true
  }

  open_upload_link2(){
    this.show_model2 = true
  }

  close_model(){
    this.show_model = false;
  }

  close_model1(){
    this.show_model1 = false;
  }

  close_model2(){
    this.show_model2 = false;
  }

}
