import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Injectable({
  providedIn: 'root'
})
export class StudentpageGuard implements CanActivate {
  constructor(private readonly userServ:UsermanagementService){}
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
      return this.userServ.isStudent()
  }
  
}
