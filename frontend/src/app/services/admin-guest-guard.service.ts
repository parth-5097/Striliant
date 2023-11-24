import { Injectable } from '@angular/core';
import {CanActivate, Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AdminGuestGuardService implements CanActivate{

  constructor(public router: Router) {}
  canActivate(): boolean {
    const token = localStorage.getItem('AdminToken');
    if (token) {
      this.router.navigate(['/admin/dashboard']);
      return false;
    }
    return true;
  }
}
