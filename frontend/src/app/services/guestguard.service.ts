import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GuestguardService implements CanActivate{

  constructor(public router: Router) {}
  canActivate(): boolean {
    const token = localStorage.getItem('Token');
    if (token) {
      this.router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}
