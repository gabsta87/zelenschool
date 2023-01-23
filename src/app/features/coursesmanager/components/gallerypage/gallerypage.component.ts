import { Component, ViewChild } from '@angular/core';

// import Swiper core and required modules
import SwiperCore, { SwiperOptions, Pagination, Swiper, Navigation } from 'swiper';
import { SwiperComponent } from 'swiper/angular';

// install Swiper modules
SwiperCore.use([Pagination]);

// const swiper2 = new Swiper('.swiper', {
//   // Optional parameters
//   loop: true,

//   // If we need pagination
//   pagination: {
//     el: '.swiper-pagination',
//   },

//   // Navigation arrows
//   navigation: {
//     nextEl: '.swiper-button-next',
//     prevEl: '.swiper-button-prev',
//   },
// });

@Component({
  selector: 'app-gallerypage',
  templateUrl: './gallerypage.component.html',
  styleUrls: ['./gallerypage.component.scss']
})
export class GallerypageComponent {

  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  config: SwiperOptions = {
    // loop:true,
    navigation:true,
    pagination:true,
  };

  onSwiper($event:any){
    console.log("onSwiper raised : ",$event);
  }

  slideNext(){
    this.swiper?.swiperRef.slideNext(100);
  }
  slidePrev(){
    this.swiper?.swiperRef.slidePrev(100);
  }

}
