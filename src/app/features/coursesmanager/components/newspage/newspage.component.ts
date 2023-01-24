import { Component } from '@angular/core';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';

@Component({
  selector: 'app-newspage',
  templateUrl: './newspage.component.html',
  styleUrls: ['./newspage.component.scss']
})
export class NewspageComponent {
  
  // articles!:{author:string,content:string,time:string,title:string};
  articles!:any;

  constructor(
    private readonly _dbAccess : AngularfireService,
    ) { 
      console.log("constructor");
  }
    
  async ionViewWillEnter(){
    console.log("view initiated");
    this.articles = await this._dbAccess.getArticles();
    console.log("articles : ",this.articles);
    console.log("articles : ",this.articles[0]);

  }

}
