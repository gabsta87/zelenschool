import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';

@Injectable({
  providedIn: 'root'
})
export class StudentpageGuard  {
  constructor(private readonly userServ:UsermanagementService){}
  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
      return this.userServ.isStudent()
  }
  
}
