import { Component } from '@angular/core';

@Component({
  selector: 'app-partnerspage',
  templateUrl: './partnerspage.component.html',
  styleUrls: ['./partnerspage.component.scss']
})
export class PartnerspageComponent {
  partners = [
    { logoName:"ukrainiandiaspora.png",link:"https://ukrainian-diaspora-geneva.ch/"},
    { logoName:"Kultura-logo.jpeg",link:"http://kultura.ch/article-4-2/"},
    { logoName:"deti.png",link:"https://detinow.ch/"},
    ]

}
