import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-founders-message',
  templateUrl: './founders-message.component.html',
  styleUrls: ['./founders-message.component.css']
})
export class FoundersMessageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    $(document).ready(function(){
      $(window).scrollTop(0);
    });
  }

}
