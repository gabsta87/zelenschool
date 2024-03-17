import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentData } from 'firebase/firestore';

@Component({
  selector: 'app-asso-event-popover',
  templateUrl: './asso-event-popover.component.html',
  styleUrls: ['./asso-event-popover.component.scss']
})
export class AssoEventPopoverComponent {
  assoEvent!:DocumentData;

  constructor(private readonly _router : Router){ }

  goToGallery(galleryId:string){
    this._router.navigate(["gallery"],{fragment:galleryId});
  }

}
