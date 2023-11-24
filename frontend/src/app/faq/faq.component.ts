import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {

  login = false;
  constructor() { }

  // tslint:disable-next-line:typedef
  isLogin(){
    try{
      const token = localStorage.getItem('Token');
      const userId = localStorage.getItem('User');
      this.login = JSON.parse(userId).type === 3;
    } catch (e){
      this.login = false;
    }
  }

  ngOnInit(): void {
    $(document).ready(() => {
      $(window).scrollTop(0);
    });
    this.isLogin();
  }
}
