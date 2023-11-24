import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-k4c',
  templateUrl: './k4c.component.html',
  styleUrls: ['./k4c.component.css']
})
export class K4cComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    $(document).ready(function(){
      $(window).scrollTop(0);
    });
  }

}
