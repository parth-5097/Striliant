import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminHttpService } from '../../services/admin-http.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.css'],
})
export class AdminHeaderComponent implements OnInit {
  adminId = '';
  firstname = '';
  lastname = '';
  email = '';
  mobileno = '';
  about = '';
  profile = '';
  priceList = [];
  calcApi = true;
  adminCalc: FormGroup;
  prPercent: any;
  total: any;
  clarity = '';
  color = '';
  shape = '';
  size: any = '';
  price: any = '';
  mulPrice: any = '';
  percent: any;
  sizeDefault: any;
  percentageDefault: any;
  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    public adminhttp: AdminHttpService,
    public http: HttpService,
    public router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {
    if (localStorage.getItem('Admin')) {
      const CurrentAdmin = JSON.parse(localStorage.getItem('Admin'));
      this.adminId = CurrentAdmin.adminId;
    }
  }

  ngOnInit(): void {
    this.sizeDefault = 0;
    this.prPercent = 0;
    this.total = 0;
    this.percentageDefault = 0;
    this.get_data();
    this.adminCalc = this.formBuilder.group({
      size: [
        this.sizeDefault,
        [
          Validators.required,
          Validators.max(200),
          Validators.min(0.0000000000000000001),
        ],
      ],
      shape: ['Round', [Validators.required]],
      color: ['D', [Validators.required]],
      clarity: ['IF', [Validators.required]],
      prPerCent: [
        parseFloat(
          this.prPercent + this.percentageDefault * parseFloat(this.prPercent)
        ),
      ],
      total: [
        parseFloat(
          this.total + this.percentageDefault * parseFloat(this.total)
        ),
      ],
      // tslint:disable
      percentage: [
        this.percentageDefault,
        [
          Validators.min(-999999999999999999999999),
          Validators.max(9999999999999999999),
          Validators.pattern(/^-?(0|[1-9]\d*)?$/),
        ],
      ],
    });
  }

  // tslint:disable-next-line
  setPercent(val) {
    if (val === -1) {
      this.percentageDefault = parseFloat(this.percentageDefault) - 0.5;
      this.adminCalc.controls.prPerCent.setValue(
        parseFloat(
          this.prPercent + this.percentageDefault * parseFloat(this.prPercent)
        )
      );
      console.log('percent:::' + this.percentageDefault);
    } else {
      this.percentageDefault =
        parseFloat(this.percentageDefault) + parseFloat('0.5');
      this.adminCalc.controls.prPerCent.setValue(
        parseFloat(
          this.prPercent + this.percentageDefault * parseFloat(this.prPercent)
        )
      );
      console.log('percent:::' + this.percentageDefault);
    }
  }

  // tslint:disable-next-line:typedef
  typePercent(val) {
    // tslint:disable-next-line:use-isnan
    if (val === '') {
      this.percentageDefault = -0;
    } else if (val === 'NaN') {
      this.percentageDefault = 0;
      // tslint:disable-next-line:use-isnan
    } else if (val === '-') {
      this.percentageDefault = parseFloat(val);
      // tslint:disable-next-line:use-isnan
    } else if (!isNaN(val)) {
      this.percentageDefault = parseFloat(val);
    } else {
      this.percentageDefault = 0;
    }
  }

  // tslint:disable-next-line:typedef
  typePriceValue(val) {
    this.percentageDefault =
      ((parseFloat(val) - parseFloat(this.price)) * 100) /
      parseFloat(this.price);
  }

  // tslint:disable-next-line:typedef
  typeTotalValue(val) {
    this.percentageDefault =
      ((parseFloat(val) - parseFloat(this.total)) * 100) /
      parseFloat(this.total);
  }

  // tslint:disable-next-line:typedef
  setParam() {
    // this.size = this.adminCalc.controls.size.value;
    this.size = this.adminCalc.get('size').value;
    this.clarity = this.adminCalc.get('clarity').value;
    this.color = this.adminCalc.get('color').value;
    this.shape = this.adminCalc.get('shape').value;
    this.percent = this.adminCalc.get('percentage').value;
    const param = {
      size: this.size,
      clarity: this.clarity,
      color: this.color,
      shape: this.shape,
    };
    this.getPrice(param);
    console.log('setparam:::' + JSON.stringify(param)); //log
  }

  // tslint:disable-next-line:typedef
  getPrice(val) {
    let index;
    if (this.size > 0) {
      if (val.shape === 'Round') {
        if (val.color.localeCompare('M') === -1) {
          // tslint:disable-next-line:max-line-length
          index = this.priceList.findIndex(
            (p) =>
              p.shape === 'ROUND' &&
              p.color === this.color &&
              p.clarity === this.clarity &&
              p.sizeMin <= this.size &&
              p.sizeMax >= this.size
          );
          this.price = this.priceList[index].pricePerCarat;
          this.setPrice();
        } else {
          // tslint:disable-next-line:max-line-length
          index = this.priceList.findIndex(
            (p) =>
              p.shape === 'ROUND' &&
              p.color === 'M' &&
              p.clarity === this.clarity &&
              p.sizeMin <= this.size &&
              p.sizeMax >= this.size
          );
          this.price = this.priceList[index].pricePerCarat;
          this.setPrice();
        }
      } else {
        if (val.color.localeCompare('M') === -1) {
          // tslint:disable-next-line:max-line-length
          index = this.priceList.findIndex(
            (p) =>
              p.shape === 'PEAR' &&
              p.color === this.color &&
              p.clarity === this.clarity &&
              p.sizeMin <= this.size &&
              p.sizeMax >= this.size
          );
          this.price = this.priceList[index].pricePerCarat;
          this.setPrice();
        } else {
          // tslint:disable-next-line:max-line-length
          index = this.priceList.findIndex(
            (p) =>
              p.shape === 'PEAR' &&
              p.color === 'M' &&
              p.clarity === this.clarity &&
              p.sizeMin <= this.size &&
              p.sizeMax >= this.size
          );
          this.price = this.priceList[index].pricePerCarat;
          this.setPrice();
        }
      }
      console.log({
        size: this.size,
        clarity: this.clarity,
        color: this.color,
        shape: this.shape,
      });
    } else {
      // pass
    }
  }

  // tslint:disable-next-line:typedef
  pressKey(val) {
    const el = document.activeElement;
    // this.percentageDefault = this.percentageDefault.toString() + val.toString();
    // console.log(`el:::::::::${(document.activeElement.value)}`);
    // console.log('val::::::::' + val);
    this.insertDataVarables(el, val);
  }

  // tslint:disable-next-line:typedef
  insertDataVarables(myField, myValue) {
    /*// IE support
    if (document.selection) {
      myField.focus();
      let sel;
      sel = document.selection.createRange();
      sel.text = myValue;
    }
    // MOZILLA and others
    else*/
    if (myField.selectionStart || myField.selectionStart == '0') {
      const startPos = myField.selectionStart;
      const endPos = myField.selectionEnd;
      console.log('one:: ' + startPos, endPos);
      myField.value =
        myField.value.substring(0, startPos) +
        myValue +
        myField.value.substring(endPos, myField.value.length);
      myField.selectionStart = startPos + myValue.length;
      myField.selectionEnd = startPos + myValue.length;
      console.log('two:: ' + startPos, endPos);

      // myField.setSelectionRange(endPos, endPos);
      // const range = document.createRange();
      // range.setStart(myField.selectionStart, myField.selectionStart);
      // myField.setEnd(endPos, 0);
      // myField.setSelectionRange(endPos, endPos);
    } else {
      myField.value += myValue;
    }
  }

  // tslint:disable-next-line:typedef
  setPrice() {
    this.mulPrice = this.price * this.size;
    return this.mulPrice;
  }

  removedata() {
    this.adminCalc.reset();
    this.percentageDefault = 0;
  }

  // tslint:disable-next-line:typedef
  pricelist() {
    if (this.calcApi) {
      const data = '';
      this.http
        .GetAPI('admin/calculator', data)
        .then((resdata: any) => {
          if (resdata.status === 200) {
            this.priceList = resdata.data;
            // console.log(this.priceList);
            this.calcApi = false;
          } else {
            this.toastr.error(resdata.message);
          }
        })
        .catch((err) => {
          this.toastr.error(err);
        });
    } else {
      // pass
    }
  }

  // tslint:disable-next-line:typedef
  get fval() {
    return this.adminCalc.controls;
  }

  // tslint:disable-next-line:typedef
  get_data() {
    const data = { adminId: this.adminId };
    this.adminhttp
      .PostAPI('admin/get_data', data)
      .then((resdata: any) => {
        if (resdata.status == 200) {
          // tslint:disable-next-line:variable-name
          const json_data = resdata.data;
          this.firstname = json_data.firstname;
          this.lastname = json_data.lastname;
          this.email = json_data.email;
          this.mobileno = json_data.mobileno;
          this.about = json_data.about;
          this.profile =
            json_data.profile != null
              ? environment.backend_url + '' + json_data.profile
              : 'assets/images/icon/users-icon-white.svg';
        } else {
          this.toastr.error(resdata.message);
        }
      })
      .catch((err) => {
        this.toastr.error(err);
      });
  }

  // tslint:disable-next-line:typedef
  logout() {
    localStorage.removeItem('Admin');
    localStorage.removeItem('AdminToken');
    this.adminhttp.token = '';
    this.adminhttp.IsAdminLogin = false;
    this.router.navigate(['admin/login']);
  }
}
