import { Component, OnInit } from '@angular/core';
import {ToastrService} from "ngx-toastr";
import {FormBuilder, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {HttpService} from "../services/http.service";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-news-details',
  templateUrl: './news-details.component.html',
  styleUrls: ['./news-details.component.css']
})
export class NewsDetailsComponent implements OnInit {

  articleID = ''
  title = ''
  description = ''
  datePosted = ''
  majorTopicTitle = ''
  imageURL = ''
  constructor(public toastr: ToastrService,
              private formBuilder: FormBuilder,
              public http: HttpService,
              public router: Router,
              private location: Location,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    const articleID = this.route.snapshot.paramMap.get('articleID');
    this.articleID = articleID;
    this.get_data()
  }

  get_data(){
    var data = {articleID:this.articleID};
    this.http.PostAPI('users/GetNewsDetails', data).then((resdata: any) => {
      if (resdata.status == 200) {
        var json_data = resdata.news
        console.log(json_data.data)
        this.title = json_data.data.article.title
        this.description = json_data.data.article.article
        this.datePosted = json_data.data.article.datePosted
        this.majorTopicTitle = json_data.data.article.majorTopicTitle
        this.imageURL = json_data.data.article.imageURL
      } else {
        this.toastr.error(resdata.message);
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

}
