import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { getDownloadURL } from 'firebase/storage';
import { BehaviorSubject, Observable, find, findIndex, firstValueFrom, map, of } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
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

  imagesToDisplay !:Observable<any>;
  
  galleries = this._route.snapshot.data['galleries'];
  imagesCollections : {id:string,name:string,images:any}[] = [];
  openFolderIndex = -1;
  openingGalleryId :string|null = null;

  currentImage!:string;
  isImageOpen = false;

  constructor(
    private readonly _storage : StorageService,
    private readonly _route:ActivatedRoute, 
    private readonly _router:Router,
    private readonly _db : AngularfireService
    ){

    this.galleries.subscribe((e:any) => { 
      this.imagesCollections = [];
      e.forEach((element:DocumentData) =>
        this.imagesCollections.push({id:element['id'],name:element['name'],images:this._storage.getGalleryImages(element['id'])})
    )})

    this._route.fragment.subscribe( fragment => { 
      this.openingGalleryId = fragment;
    })
  }

  ionViewDidEnter(){
    this.openFolderIndex = -1;
    this.imagesToDisplay = of([]);
  }

  async ionViewWillEnter(){
    if(this.openingGalleryId){
      
      if(this.openingGalleryId)
        this.openGallery(this.openingGalleryId);

      this.openingGalleryId = null;
      this._router.navigate([]);
    }
  }

  async openGallery(galleryId:string,index?:number){
    let foundIndex = 0;
    if(index == undefined){
          foundIndex= await firstValueFrom(this.galleries.pipe(map((galleriesList:any) =>
          galleriesList.findIndex((gallery:any)=>gallery.id == galleryId )
        )));
    }else{
      foundIndex = index
    }

    this.openFolderIndex = foundIndex;
    
    if(!this.imagesCollections[foundIndex].images){
      this.imagesCollections[foundIndex].images = this._storage.getGalleryImages(galleryId);
    }

    this.imagesToDisplay = this.imagesCollections[foundIndex].images;
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

  showFullSizeImage(link:string){
    this.currentImage = link;
    this.isImageOpen = true;
  }

  closeFullSizeImage(){
    this.isImageOpen = false;
  }

}