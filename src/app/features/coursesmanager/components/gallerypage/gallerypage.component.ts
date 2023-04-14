import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { getDownloadURL } from 'firebase/storage';
import { Observable } from 'rxjs';
import { StorageService } from 'src/app/shared/service/storage.service';

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

  images !:Observable<any>;
  
  galleries = this._storage.getGalleries();
  imagesCollections : {id:string,name:string,images:any}[] = [];
  openFolderIndex = -1;

  constructor(private readonly _storage : StorageService){
    this.galleries.subscribe((e:any) => { 
      this.imagesCollections = [];
      e.forEach((element:DocumentData) =>
        this.imagesCollections.push({id:element['id'],name:element['name'],images:this._storage.getGalleryImages(element['id'])})
    )})
  }

  async openGallery(galleryId:string,index:number){
    this.openFolderIndex = index;
    
    if(!this.imagesCollections[index].images){
      this.imagesCollections[index].images = this._storage.getGalleryImages(galleryId);
    }

    this.images = this.imagesCollections[index].images;
  }


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