import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [{
  path:'',
  loadChildren:()=>import("./features/coursesmanager/coursesmanager.module").then(fichier=>fichier.CoursesmanagerModule)
},{
  path:'**',
  redirectTo:'',
  pathMatch:'full'
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
