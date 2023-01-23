import { Component, ViewChild, ViewEncapsulation } from '@angular/core';

// import Swiper core and required modules
import SwiperCore, { SwiperOptions, Pagination, Navigation } from 'swiper';
import { SwiperComponent } from 'swiper/angular';

// install Swiper modules
SwiperCore.use([Pagination,Navigation]);

@Component({
  selector: 'app-gallerypage',
  templateUrl: './gallerypage.component.html',
  styleUrls: ['./gallerypage.component.scss'],
  encapsulation: ViewEncapsulation.None 
})
export class GallerypageComponent {

  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  ngAfterContentChecked(){
    if(this.swiper){
      this.swiper.updateSwiper({});
    }
  }

  config: SwiperOptions = {
    slidesPerView:1.25,
    loop:true,
    navigation:true,
    pagination:true,
  };

  slideNext(){
    this.swiper?.swiperRef.slideNext(100);
  }
  slidePrev(){
    this.swiper?.swiperRef.slidePrev(100);
  }

}
