import { Component, OnInit, ViewChild} from '@angular/core';
import {AdminHttpService} from "../../services/admin-http.service";
import * as moment from 'moment';
import {ChartComponent, ApexChart, ApexAxisChartSeries, ApexTitleSubtitle, ApexDataLabels, ApexFill, ApexYAxis, ApexXAxis, ApexTooltip, ApexMarkers, ApexAnnotations, ApexStroke} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  markers: ApexMarkers;
  title: ApexTitleSubtitle;
  fill: ApexFill;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  annotations: ApexAnnotations;
  colors: any;
  toolbar: any;
};



@Component({
  selector: 'app-admin-analytics-dashboards',
  templateUrl: './admin-analytics-dashboards.component.html',
  styleUrls: ['./admin-analytics-dashboards.component.css']
})
export class AdminAnalyticsDashboardsComponent implements OnInit {

  now = moment().format('DD MMM YYYY');
  month = moment().subtract(1, 'months').format('DD MMM YYYY');
  sixmonth = moment().subtract(6, 'months').format('DD MMM YYYY');
  year = moment().subtract(1, 'year').format('DD MMM YYYY');
  startyear = moment().startOf('year').format('DD MMM YYYY');
  data: any;
  total: any;

  constructor(public adminhttp: AdminHttpService) {
  }



  @ViewChild('chart', { static: false }) chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  public activeOptionButton = 'all';

  public updateOptionsData = {
    '1m': {
      xaxis: {
        min: new Date(this.month).getTime(),
        max: new Date(this.now).getTime()
      }
    },
    '6m': {
      xaxis: {
        min: new Date(this.sixmonth).getTime(),
        max: new Date(this.now).getTime()
      }
    },
    '1y': {
      xaxis: {
        min: new Date(this.year).getTime(),
        max: new Date(this.now).getTime()
      }
    },
    '1yd': {
      xaxis: {
        min: new Date(this.startyear).getTime(),
        max: new Date(this.now).getTime()
      }
    },
    all: {
      xaxis: {
        min: undefined,
        max: undefined
      }
    }
  };

  initChart(val): void {
    this.chartOptions = {
      series: [
        {
          data: val
        }
      ],
      chart: {
        type: 'area',
        height: 350
      },
      dataLabels: {
        enabled: true
      },
      markers: {
        size: 0,
        colors: ['#033603']
      },
      xaxis: {
        type: 'datetime',
        min: 1614556800000,                       // new Date('01 Mar 2021').getTime(),
        tickAmount: 600
      },
      tooltip: {
        x: {
          format: 'dd MMM yyyy'
        }
      },
      stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        width: 2,
        dashArray: 0,
        colors: ['#033603']
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 2,
          gradientToColors: ['#033603'],
          opacityFrom: 1,
          opacityTo: 0,
          stops: [0, 100]
        },
        colors: ['#033603']
      }
    };
  }

  public updateOptions(option: any): void {
    this.activeOptionButton = option;
    this.chart.updateOptions(this.updateOptionsData[option], true, true, true);
  }

  storeRate() {
    this.adminhttp.GetAPI('admin/analytics-sales', '').then((resdata) => {
      if (resdata['status'] == 200) {
        this.data = resdata['data'][0];
        this.initChart(this.data);
        this.total = resdata['data'][1];
      }
    })
  }


  ngOnInit(): void {
    this.adminhttp.GetAPI('admin/analytics-sales', '').then((resdata) => {
      if (resdata['status'] == 200) {
        this.data = resdata['data'][0];
        this.initChart(this.data);
        this.total =  resdata['data'][1];
      }
    })

  }

}
