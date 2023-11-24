import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {FormBuilder} from '@angular/forms';
import {Location} from '@angular/common';
import {HttpService} from '../services/http.service';

@Component({
  selector: 'app-buy-requests-details',
  templateUrl: './buy-requests-details.component.html',
  styleUrls: ['./buy-requests-details.component.css']
})
export class BuyRequestsDetailsComponent implements OnInit {

  buy_requests_id = '';
  RequestsDetails = '';
  constructor(private sanitizer: DomSanitizer,
              public router: Router,
              public toastr: ToastrService,
              public http: HttpService,
              private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private location: Location
  ) { }

  ngOnInit(): void {
    const buy_requests_id = this.route.snapshot.paramMap.get('buy_requests_id');
    this.buy_requests_id = buy_requests_id;
    this.get_data();
  }

  get_data(){
    var data = {buy_requests_id: this.buy_requests_id};
    this.http.PostAPI('users/GetBuyRequests', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.RequestsDetails =  resdata.data;
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
