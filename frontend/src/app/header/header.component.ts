import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, AfterViewInit {
  firstname = '';
  lastname = '';
  userId = '';
  CountCartItem;
  // tslint:disable-next-line:variable-name
  company_logo = '';
  priceList = [];
  calcApi = true;
  calc: FormGroup;
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
  fieldId: any = '';
  formPrPercent: any;

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public toastr: ToastrService,
    public http: HttpService,
    private formBuilder: FormBuilder
  ) {
    if (localStorage.getItem('User')) {
      const CurrentUser = JSON.parse(localStorage.getItem('User'));
      this.userId = CurrentUser.userId;
    }
  }

  ngOnInit(): void {
    // this.http.GetAPI('admin/calculator', {}).then((res) => {
    //   console.log(res);
    // });
    this.sizeDefault = 0;
    this.prPercent = 0;
    this.total = 0;
    this.percentageDefault = 0;
    this.cartItem();
    this.get_data();
    this.formPrPercent = parseFloat(
      this.prPercent + this.percentageDefault * parseFloat(this.prPercent)
    );
    this.calc = this.formBuilder.group({
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
      // tslint:disable-next-line:max-line-length
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

  // tslint:disable-next-line:typedef
  setPercent(val) {
    if (val === -1) {
      this.percentageDefault = parseFloat(this.percentageDefault) - 0.5;
      this.calc.controls.prPerCent.setValue(
        parseFloat(
          this.prPercent + this.percentageDefault * parseFloat(this.prPercent)
        )
      );
      // console.log('percent:::' + this.percentageDefault);
    } else {
      this.percentageDefault =
        parseFloat(this.percentageDefault) + parseFloat('0.5');
      this.calc.controls.prPerCent.setValue(
        parseFloat(
          this.prPercent + this.percentageDefault * parseFloat(this.prPercent)
        )
      );
      // console.log('percent:::' + this.percentageDefault);
    }
  }

  // tslint:disable-next-line:typedef
  typePercent(val) {
    console.log(val);
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
    // this.size = this.calc.controls.size.value;
    this.size = this.calc.get('size').value;
    this.clarity = this.calc.get('clarity').value;
    this.color = this.calc.get('color').value;
    this.shape = this.calc.get('shape').value;
    this.percent = this.calc.get('percentage').value;
    const param = {
      size: this.size,
      clarity: this.clarity,
      color: this.color,
      shape: this.shape,
    };
    this.getPrice(param);
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
      // console.log({size: this.size, clarity: this.clarity, color: this.color, shape: this.shape});
    } else {
      // pass
    }
  }

  // tslint:disable-next-line:typedef
  invSign() {}

  // tslint:disable-next-line:typedef
  getID(event) {
    console.log(event);
    this.fieldId = event.target.getAttribute('formControlName');
  }

  // tslint:disable-next-line:typedef
  pressKey(val: any) {
    let input = <HTMLInputElement>document.activeElement;

    if (input.tagName == 'INPUT' || input.tagName == 'TEXTAREA') {
      input.value += val.toString();
    }
    if (this.fieldId == 'percentage') {
    }
    if (this.fieldId == 'total') {
    }
    if (this.fieldId == 'prPerCent') {
      this.prPercent = this.prPercent.toString() + val.toString();
      // this.typePriceValue(parseFloat(this.calc.value[this.fieldId].toString() + val.toString()));
      this.typePriceValue(parseFloat(this.prPercent));
    }
    if (this.fieldId == 'size') {
      this.setParam();
    }
    // console.log(this.calc.get('size').value);
  }

  // tslint:disable-next-line:typedef
  removedata() {
    this.calc.controls[this.fieldId].setValue(0);
    this.percentageDefault = 0;
  }

  /*// tslint:disable-next-line:typedef
  pressKey(val){
    const el = document.activeElement;
    // console.log(`el:::::::::${(document.activeElement.value)}`);
    // console.log('val::::::::' + val);
    this.insertDataVarables(el, val);
  }

  // tslint:disable-next-line:typedef
  insertDataVarables(myField, myValue) {
    /!*!// IE support
    if (document.selection) {
      myField.focus();
      let sel;
      sel = document.selection.createRange();
      sel.text = myValue;
    }
    // MOZILLA and others
    else*!/
    if (myField.selectionStart || myField.selectionStart == '0') {
      const startPos = myField.selectionStart;
      const endPos = myField.selectionEnd;
      console.log('one:: ' + startPos, endPos);
      myField.value = myField.value.substring(0, startPos)
        + myValue
        + myField.value.substring(endPos, myField.value.length);
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
  }*/

  setPrice() {
    this.mulPrice = this.price * this.size;
    return this.mulPrice;
  }
  // tslint:disable-next-line:typedef
  cartItem() {
    const data = { userId: this.userId };
    this.http
      .PostAPI('users/GetCartItem', data)
      .then((resdata: any) => {
        // tslint:disable-next-line:triple-equals
        if (resdata.status == 200) {
          this.CountCartItem = resdata.data.length;
        } else {
          this.CountCartItem = 0;
        }
      })
      .catch((err) => {
        this.toastr.error(err);
      });
  }

  // tslint:disable-next-line:typedef
  get_data() {
    const data = { userId: this.userId };
    this.http
      .PostAPI('users/get_data', data)
      .then((resdata: any) => {
        // tslint:disable-next-line:triple-equals
        if (resdata.status == 200) {
          // tslint:disable-next-line:variable-name prefer-const
          let json_data = resdata.data;
          this.firstname = json_data.firstname;
          this.lastname = json_data.lastname;
          this.company_logo =
            json_data.company_logo != null
              ? environment.backend_url + '' + json_data.company_logo
              : 'assets/images/icon/users-icon.svg';
        } else {
          this.toastr.error(resdata.message);
        }
      })
      .catch((err) => {
        this.toastr.error(err);
      });
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
    return this.calc.controls;
  }

  // tslint:disable-next-line:typedef
  logout() {
    localStorage.removeItem('User');
    localStorage.removeItem('Token');
    this.http.token = '';
    this.http.IsUserLogin = false;
    this.router.navigate(['login']);
  }

  ngAfterViewInit() {}
}
