import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthguardService implements CanActivate{

  constructor(public router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('AdminToken');
    if (!token) {
      this.router.navigate(['/admin/login']);
      return false;
    }
    return true;
  }
}
