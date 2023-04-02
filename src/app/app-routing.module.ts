import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path:'',
  loadChildren:()=>import("./features/coursesmanager/coursesmanager.module").then(fichier=>fichier.CoursesmanagerModule)
},{
  path:'',
  redirectTo:'/about',
  pathMatch:'full',
},{ 
  path: '**', 
  redirectTo: "/about",
  pathMatch:'full',
}];

const routerOptions: ExtraOptions = {
  useHash: false,
  anchorScrolling: 'enabled',
  onSameUrlNavigation: 'reload', //Must have if you want to be able to use the anchor more than once
  scrollPositionRestoration: 'enabled',
};

@NgModule({
  imports: [RouterModule.forRoot(routes,routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
