import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-admin-view-requests',
  templateUrl: './admin-view-requests.component.html',
  styleUrls: ['./admin-view-requests.component.css']
})
export class AdminViewRequestsComponent implements OnInit {

  buy_requests_id = ''
  RequestsDetails = ''
  buyRequestsStance = 0;
  constructor(public router: Router, public toastr: ToastrService, public adminhttp: AdminHttpService, private formBuilder: FormBuilder, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const buy_requests_id = this.route.snapshot.paramMap.get('buy_requests_id');
    this.buy_requests_id = buy_requests_id;
    this.get_data()
  }

  get_data(){
    var data = {buy_requests_id:this.buy_requests_id}
    this.adminhttp.PostAPI('admin/GetBuyRequests', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.RequestsDetails =  resdata.data;
        this.buyRequestsStance = resdata.data.stance;
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  changestatus(stance){
    var data = { buy_requests_id: this.buy_requests_id, stance: stance }             // status 0: Open, 1: Admin View, 2: Admin Review, 3: Admin Accepted, 4: Admin Rejected
    this.adminhttp.PostAPI('admin/buyRequestStance', data).then((resdata: any) => {
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
