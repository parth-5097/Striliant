import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-brand-entity',
  templateUrl: './brand-entity.component.html',
  styleUrls: ['./brand-entity.component.css']
})
export class BrandEntityComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    $(document).ready(function(){
      $(window).scrollTop(0);
    });
  }

}
