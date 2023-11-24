import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {AdminHttpService} from "../../services/admin-http.service";
import {FormBuilder, Validators} from "@angular/forms";
import {Location} from "@angular/common";
import {environment} from "../../../environments/environment";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-admin-diamonds-details',
  templateUrl: './admin-diamonds-details.component.html',
  styleUrls: ['./admin-diamonds-details.component.css']
})
export class AdminDiamondsDetailsComponent implements OnInit {

  diamond_id = ''
  DiamondDetails = ''
  constructor(private sanitizer: DomSanitizer, public router: Router, public toastr: ToastrService, public adminhttp: AdminHttpService, private formBuilder: FormBuilder, private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {
    const diamond_id = this.route.snapshot.paramMap.get('diamond_id');
    this.diamond_id = diamond_id;
    this.get_data()
  }

  get_data(){
    var data = {diamond_id:this.diamond_id}
    this.adminhttp.PostAPI('admin/GetDiamonds', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.DiamondDetails =  resdata.data
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  photoURL(name) {
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

  async download(url) {
    const a = document.createElement("a");
    a.href = await this.toDataURL(url);
    a.download = "download.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  fullURL(name){
    var pattern = /^((http|https|ftp):\/\/)/;
    if(pattern.test(name)) {
      return name;
    }else{
      return environment.backend_url+''+name;
    }
  }

}
