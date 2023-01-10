import { Component, ViewChild } from '@angular/core';

// import Swiper core and required modules
import SwiperCore, { SwiperOptions,Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { SwiperComponent } from 'swiper/angular';

// install Swiper modules
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

@Component({
  selector: 'app-gallerypage',
  templateUrl: './gallerypage.component.html',
  styleUrls: ['./gallerypage.component.scss']
})
export class GallerypageComponent {

  @ViewChild('swiper', { static: false }) swiper?: SwiperComponent;

  config: SwiperOptions = {
    slidesPerView: 3,
    spaceBetween: 50,
    navigation: true,
    pagination: { clickable: true },
    scrollbar: { draggable: true },
  };

  onSwiper($event:any){
    console.log("slide changed : ",$event);
    
  }

  onSlideChange(){
    console.log("slide changing ");
    
  }

  slideNext(){
    this.swiper?.swiperRef.slideNext(100);
  }
  slidePrev(){
    this.swiper?.swiperRef.slidePrev(100);
  }

}
