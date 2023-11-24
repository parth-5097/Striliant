import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-k-grading',
  templateUrl: './k-grading.component.html',
  styleUrls: ['./k-grading.component.css']
})
export class KGradingComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    $(document).ready(function(){
      $(window).scrollTop(0);
    });
  }

}
