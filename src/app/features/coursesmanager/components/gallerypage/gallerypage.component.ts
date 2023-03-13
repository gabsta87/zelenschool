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

  images = [
    "IMG-20220627-WA0016.jpg",
    "IMG-20220729-WA0043.jpg",
    "IMG-20220627-WA0045.jpg",
    "IMG-20220730-WA0006.jpg",
    "IMG-20220627-WA0049.jpg",
    "IMG-20220628-WA0028.jpg",
    "IMG-20220707-WA0014.jpg",
    "IMG-20220712-WA0003.jpg",
    "IMG-20220722-WA0003.jpg",
    "IMG-20220729-WA0041.jpg",
    "IMG-20220725-WA0018-1.jpg",
    "IMG_20220811_120348_463.jpg",
    "IMG_20220811_120319_583.jpg",
    "IMG_20220607_113736_327.jpg",
    "IMG_20220811_114818_117.jpg",
    "IMG_20220811_120150_093.jpg",
    "IMG_20220811_120158_143.jpg",
    "IMG_20220811_120249_968.jpg",
    "IMG_20220811_120328_275.jpg",
    "photo_2022-08-25_09-09-24.jpg",
    "WhatsApp-Image-2022-04-30-at-2.19.37-PM.jpeg",
    "WhatsApp-Image-2022-04-30-at-3.11.32-PM.jpeg",
    "WhatsApp-Image-2022-05-02-at-10.27.42-AM.jpeg",
    "WhatsApp-Image-2022-08-14-at-11.46.56-AM.jpeg",
    "WhatsApp-Image-2022-08-14-at-11.52.07-AM.jpeg",
  ]
  ngAfterContentChecked(){
    if(this.swiper){
      this.swiper.updateSwiper({});
    }
  }

  config: SwiperOptions = {
    slidesPerView:1,
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

  selectImage(index:number){
    this.swiper?.swiperRef.slideTo(index);
  }

}
