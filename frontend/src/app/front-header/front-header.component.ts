import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-front-header',
  templateUrl: './front-header.component.html',
  styleUrls: ['./front-header.component.css'],
})
export class FrontHeaderComponent implements OnInit, AfterViewInit {
  blogActive = 1;
  CurrentUrl = '';
  changeImg = 1;

  constructor(
    public toastr: ToastrService,
    private formBuilder: FormBuilder,
    public router: Router,
    public http: HttpService
  ) {}

  ngOnInit(): void {
    this.CurrentUrl = this.router.url;
    this.get_data_settings();
  }

  ngAfterViewInit() {
    $(document).ready(() => {
      $(document).on('mouseover', '#hoverable-megamenu li a', function (e) {
        $('#image-1').attr('src', $(this).data('img'));
      });

      $('.search-dropdown').on('click', () => {
        $('.search-dropdown-box').toggle();
      });
    });
  }

  get_data_settings() {
    var data = {};
    this.http
      .PostAPI('users/GetRecordSettings', data)
      .then((resdata: any) => {
        if (resdata.status == 200) {
          this.blogActive = parseInt(resdata.data[2].status);
        }
      })
      .catch((err) => {
        this.toastr.error(err);
      });
  }
}
