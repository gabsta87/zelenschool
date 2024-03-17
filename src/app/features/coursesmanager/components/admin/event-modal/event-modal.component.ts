import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DocumentData } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { StorageService } from 'src/app/shared/service/storage.service';

@Component({
  selector: 'app-event-modal',
  templateUrl: './event-modal.component.html',
  styleUrls: ['./event-modal.component.scss']
})
export class EventModalComponent {

  profileForm!:FormGroup<{
    name:FormControl<string|null>,
    location:FormControl<string|null>,
    participants:FormControl<string|null>,
    leafletLink:FormControl<string|null>,
    startDay:FormControl<string|null>,
    endDay:FormControl<string|null>,
    galleryId:FormControl<string|null>,
  }>;

  id!: string;
  galleryId!: string;
  leafletLink!: string;
  location!: string;
  name!: string;
  participants!: string;
  timeStart!: string;
  timeEnd!: string;

  galleries!: Observable<DocumentData[]>;

  constructor(
    private readonly modalCtrl: ModalController,
    private readonly _db : AngularfireService,
    private readonly _storage : StorageService,
  ) {
    this.galleries = this._db.getGalleries();
  }

  ngOnInit(){
    this.profileForm = new FormGroup({
      name: new FormControl(this.name, Validators.required),
      location: new FormControl(this.location),
      participants: new FormControl(this.participants),
      leafletLink: new FormControl(this.leafletLink),
      startDay: new FormControl(this.timeStart),
      endDay: new FormControl(this.timeEnd),
      galleryId: new FormControl(this.galleryId),
    });
  }

  confirm() {
    if(!this.profileForm.valid)
    // if(!this.dayInputValid || !this.profileForm.valid)
      return;
    let entry = {
      id: this.id,
      name: this.profileForm.get('name')?.value,
      location: this.profileForm.get('location')?.value,
      participants: this.profileForm.get('participants')?.value,
      leafletLink: this.profileForm.get('leafletLink')?.value,
      timeStart: this.profileForm.get('timeStart')?.value,
      timeEnd: this.profileForm.get('timeEnd')?.value,
      galleryId: this.profileForm.get('galleryId')?.value,
    }

    return this.modalCtrl.dismiss(entry, 'confirm');
  }

  cancel() {
    return this.modalCtrl.dismiss(undefined, 'cancel');
  }

  get dayInputValid(): boolean {
    return (this.profileForm.get('startDay')?.valid && this.profileForm.get('endDay')?.valid) || false;
  }

  // selectGallery(id:string){
  //   this.galleryId = id;
  // }

}
