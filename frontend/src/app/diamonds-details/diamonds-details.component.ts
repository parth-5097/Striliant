import { Component, OnInit } from '@angular/core';
import {environment} from "../../environments/environment";
import {DomSanitizer} from "@angular/platform-browser";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {FormBuilder} from "@angular/forms";
import {Location} from "@angular/common";
import {HttpService} from "../services/http.service";
import { DiamondsComponent } from '../diamonds/diamonds.component'

@Component({
  selector: 'app-diamonds-details',
  templateUrl: './diamonds-details.component.html',
  styleUrls: ['./diamonds-details.component.css']
})
export class DiamondsDetailsComponent implements OnInit {

  diamond_id = ''
  DiamondDetails = ''
  link: any;
  sessionStore: boolean;
  constructor(private sanitizer: DomSanitizer, public router: Router, public toastr: ToastrService, public http: HttpService, private formBuilder: FormBuilder, private route: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {
    const diamond_id = this.route.snapshot.paramMap.get('diamond_id');
    this.diamond_id = diamond_id;
    this.get_data()
  }

  get_data(){
    var data = {diamond_id:this.diamond_id}
    this.http.PostAPI('users/GetDiamonds', data).then((resdata: any) => {
      if (resdata.status == 200) {
        this.DiamondDetails =  resdata.data
        this.link = this.fullURL(this.DiamondDetails['diamond_img'])
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

  redirectDiamond(){
    // this.diamondComponent.redirectedPage = true;
    // this.router.navigate(['/diamonds']);
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

  tostr(){
    console.log('Link Copy in Clipboard.')
    this.toastr.success('Link Copy in Clipboard.')
  }

  clipcopy(){
    return false
  }

  sessionBack(){
    sessionStorage.setItem('DiamondsDetailSession', 'true');
  }

}
