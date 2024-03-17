import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { DocumentData } from 'firebase/firestore';

@Component({
  selector: 'app-asso-event-popover',
  templateUrl: './asso-event-popover.component.html',
  styleUrls: ['./asso-event-popover.component.scss']
})
export class AssoEventPopoverComponent {
  assoEvent!:DocumentData;

  constructor(private readonly _router : Router,
    private readonly _popoverControler : PopoverController
    ){ }

  goToGallery(galleryId:string){
    this._popoverControler.dismiss();
    this._router.navigate(["gallery"],{fragment:galleryId});
  }

}
