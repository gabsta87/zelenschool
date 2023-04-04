import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-aboutpage',
  templateUrl: './aboutpage.component.html',
  styleUrls: ['./aboutpage.component.scss']
})
export class AboutpageComponent {
  @ViewChild('aboutIonContent') myDiv!: ElementRef;
  element!: HTMLElement;
  constructor(private readonly _router : Router,private readonly _route: ActivatedRoute){
    this._route.fragment.subscribe(fragment => { 
      console.log("updating fragment : ",fragment);
      
      this.fragment = fragment; 

      this.myAnchor = document.querySelector('#' + this.fragment);
      
      if(this.myAnchor && this.fragment){
        console.log("subscribe : scrolling to");
        this.scrollToElement(this.myAnchor);
      }
    });
  }
  members = [
    {
      name:"Nadiia Olarean",
      photo:"Nadza_2.jpeg",
      role:"Founding member",
      link:"https://www.linkedin.com/in/nadiia-o-a046854/"
    },
    {
      name:"Luba Bondarenko",
      photo:"Luba.jpeg",
      role:"Founding member",
      link:"https://www.linkedin.com/in/lubabondarenko/"
    },
    {
      name:"Maryna Zakrevska",
      photo:"Maryna.jpeg",
      role:"Founding member",
      link:"https://www.linkedin.com/in/maryna-zakrevska-1645b94/"
    },
    {
      name:"Ekaterina Akulich",
      photo:"Ekaterina.jpeg",
      role:"Founding member",
      link:"https://www.linkedin.com/in/ekaterina-akulich-b74a7011/"
    },
    {
      name:"Dmitry Milashchuk",
      photo:"Dmitry.jpeg",
      role:"Member",
      link:"https://www.linkedin.com/in/dmitry-milashchuk/"
    },
    {
      name:"Olga Bondar",
      photo:"Olga.jpeg",
      role:"Treasurer",
      link:"https://www.linkedin.com/in/olga-bondar-fpaa/"
    },
    {
      name:" Nataliya Domnina",
      photo:"Nataliya.jpeg",
      role:"Member",
      link:"https://www.linkedin.com/in/nataliya-domnina-9a3995a/"
    },
    {
      name:"Mariia Vashchuk",
      photo:"Mariia.jpeg",
      role:"Member",
      link:"https://www.linkedin.com/in/mariia-vashchuk-b24647223"
    },
    {
      name:"Inna Akhtyrska",
      photo:"Inna.jpeg",
      role:"Member",
      link:"https://www.linkedin.com/in/inna-akhtyrska-397a86147"
    },
    {
      name:"Liudmyla Bakhmut",
      photo:"Liudmyla.jpeg",
      role:"Member",
    },
    {
      name:"Iryna Horobets",
      photo:"Iryna.jpeg",
      role:"Member",
    },
    // {
    //   name:"Yana Manoilo",
    //   photo:"Yana.jpeg",
    //   role:"Project manager",
    // },
    {
      name:"Inna Ivanisenko",
      photo:"Inna_I.jpeg",
      role:"Member",
    },
    {
      name:"Ninel Omelianenko ",
      photo:"Ninel.jpeg",
      role:"Member",
    },
    {
      name:"Natalia Korogod",
      photo:"Natalia.png",
      role:"Member",
    },
  ]

  partners_addresses = [
    { logoName:"ukrainiandiaspora.png",link:"https://ukrainian-diaspora-geneva.ch/"},
    { logoName:"Kultura-logo.jpeg",link:"http://kultura.ch/article-4-2/"},
    { logoName:"deti.png",link:"https://detinow.ch/"},
    ]

  scrollToElement(element:any): void {
    console.log("scrollToElement : ",element);
    
    element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }

  ionViewWillEnter(){
    console.log("Ion View Will Enter");
    try {
      if(document){
        this.myAnchor = document.querySelector('#' + this.fragment);
        console.log("anchor : ",this.myAnchor);
        console.log("fragment : ",this.fragment);
        
        if(this.myAnchor && this.fragment){
          console.log("ViewWillEnter : scrolling to");
          
          this.scrollToElement(this.myAnchor);
        }
      }
    } catch (e) { }
  }

  ngAfterViewInit(){
    console.log("After view init");
    if(this.myAnchor){
      console.log("After view : scrolling to");
      this.scrollToElement(this.myAnchor);
    }
  }

  ionViewDidEnter(){
    console.log("Ion view did enter");
    if(this.myAnchor){
      console.log("DidEnter : scrolling to");
      this.scrollToElement(this.myAnchor);
    }
  }

  fragment!:any;
  myAnchor!:any;


}
