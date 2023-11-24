import {Component, Inject, OnInit, Renderer2} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {AdminHttpService} from '../../services/admin-http.service';
import { environment } from '../../../environments/environment';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid
} from 'ng-apexcharts';
import {DomSanitizer} from '@angular/platform-browser';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  adminId = '';
  snapshotData = [];
  snapshotCategories = [];
  new_products = 0;
  enquiry = 0;
  reminder = 0;
  month_1 = 0;
  month_6 = 0;
  year_1 = 0;
  year_2 = 0;
  step: number = 1;
  featured_stone_array = [];
  portfolio_data = [];
  portfolio_array_label = [];
  portfolio_array = [];
  portfolio_clarity = [];
  portfolio_percentage = [];
  Metal = [];
  Currencies = [];
  public chartOptions: Partial<ChartOptions>;

  constructor(public router: Router,
            private sanitizer: DomSanitizer,
            public toastr: ToastrService,
            public adminhttp: AdminHttpService,
            @Inject(DOCUMENT) document, r: Renderer2) {
    r.removeClass(document.body, 'bg-body-class');
    if (localStorage.getItem('Admin')) {
      let CurrentAdmin = JSON.parse(localStorage.getItem('Admin'));
      this.adminId = CurrentAdmin.adminId;
    }
  }

  ngOnInit(): void {
    this.count_get_data();
    this.line_chart();
    this.snapshot();
    this.featured_stone();
    this.portfolio();
    this.financial_data();
  }

  featuredstone = {
    arrows: false,
    dots: true,
    autoplay: true,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1650,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 3,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 3,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 890,
        settings: {
          slidesToShow: 2,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          arrows: false,
          dots: true,
        },
      },
    ]
  };

  line_chart() {
    this.chartOptions = {
      series: [
        {
          name: 'USD',
          data: this.snapshotData,
        },
      ],
      chart: {
        height: 500,
        type: 'line',
        zoom: {
          enabled: true,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        width: 2,
        dashArray: 0,
        colors: ['#033603']
      },
      xaxis: {
        categories: this.snapshotCategories,
      }
    };
  }

  count_get_data() {
    var data = {adminId: this.adminId};
    this.adminhttp.PostAPI('admin/dashboard', data).then((resdata: any) => {
      if (resdata.status == 200) {
        var json_data = resdata.data;
        if (json_data[0][0] != undefined) {
          this.new_products = json_data[0][0].new_products;
        }
        if (json_data[1][0] != undefined) {
          this.enquiry = json_data[1][0].enquiry;
        }
        if (json_data[2][0] != undefined) {
          this.reminder = json_data[2][0].diamondList.split(',').length;
        }
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  refreshchart(step) {
    this.step = step;
    this.snapshot();
  }

  snapshot() {
    var data = {};
    this.adminhttp.PostAPI('admin/snapshort', data).then((resdata: any) => {
      if (resdata.status == 200) {
        var json_data = resdata.data;
        this.month_1 = resdata.month_1;
        var json_data1 = resdata.data1;
        this.month_6 = resdata.month_6;
        var json_data2 = resdata.data2;
        this.year_1 = resdata.year_1;
        var json_data3 = resdata.data3;
        this.year_2 = resdata.year_2;
        // this.snapshotData = [0];
        // this.snapshotCategories = ['1 Mar 21'];
        if (this.step == 1) {
          this.snapshotData = [];
          this.snapshotCategories = [];
          for (var i = 0; i < json_data.length; i++) {
            this.snapshotData.push(json_data[i].total_price.toFixed(2));
            this.snapshotCategories.push(json_data[i].created_at);
          }
        }
        if (this.step == 2) {
          this.snapshotData = [];
          this.snapshotCategories = [];
          for (var i = 0; i < json_data1.length; i++) {
            this.snapshotData.push(json_data1[i].total_price.toFixed(2));
            this.snapshotCategories.push(json_data1[i].created_at);
          }
        }
        if (this.step == 3) {
          this.snapshotData = [];
          this.snapshotCategories = [];
          for (var i = 0; i < json_data2.length; i++) {
            this.snapshotData.push(json_data2[i].total_price.toFixed(2));
            this.snapshotCategories.push(json_data2[i].created_at);
          }
        }
        if (this.step == 4) {
          this.snapshotData = [];
          this.snapshotCategories = [];
          for (var i = 0; i < json_data3.length; i++) {
            this.snapshotData.push(json_data3[i].total_price.toFixed(2));
            this.snapshotCategories.push(json_data3[i].created_at);
          }
        }
        this.line_chart();
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  featured_stone() {
    this.adminhttp.PostAPI('admin/featured_stone', {}).then((resdata: any) => {
      if (resdata.status == 200) {
        this.featured_stone_array = resdata.data;
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  portfolio() {
    this.adminhttp.PostAPI('admin/portfolio', {}).then((resdata: any) => {
      if (resdata.status == 200) {
        this.portfolio_data = resdata.alldata;
        this.portfolio_array_label = resdata.data;
        this.portfolio_array = resdata.data1;

        var ordered_clarity =  ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];
        for (var i in ordered_clarity){
          if (this.portfolio_array_label.includes(ordered_clarity[i])) {
            this.portfolio_clarity.push(ordered_clarity[i]);
            this.portfolio_percentage.push(this.portfolio_array[this.portfolio_array_label.indexOf(ordered_clarity[i])]);
          }
        }

        var options = {
          series: [
            {
              name: 'Clarity',
              data: this.portfolio_percentage
            }
          ],
          chart: {
            type: 'bar',
            height: 350
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '35%',
              endingShape: 'rounded'
            },
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            show: true,
            width: 2,
            colors: ['transparent']
          },
          xaxis: {
            categories: this.portfolio_clarity,
            title: {
              text: 'Clarity'
            }
          },
          yaxis: {
            title: {
              text: 'Percentage'
            }
          },
          fill: {
            opacity: 1,
            colors: ['#033603']
          },
          tooltip: {
            y: {
              formatter: (val) => {
                return val + ' %';
              }
            }
          }
        };
        // @ts-ignore
        var chart = new ApexCharts(document.querySelector('#chart-portfolio'), options);
        chart.render();
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  financial_data() {
    this.adminhttp.PostAPI('admin/financial_data', {}).then((resdata: any) => {
      if (resdata.status == 200) {
        this.Currencies = resdata.Yahoo;
        this.Metal = resdata.Metal;
      }
    }).catch((err) => {
      this.toastr.error(err);
    });
  }

  photoURL(name) {
    var pattern = /^((http|https|ftp):\/\/)/;
    if (pattern.test(name)) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(name);
    }else{
      return this.sanitizer.bypassSecurityTrustResourceUrl(environment.backend_url + '' + name);
    }
  }

}
