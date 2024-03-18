import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { DocumentData } from 'firebase/firestore';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { StorageService } from 'src/app/shared/service/storage.service';

@Component({
  selector: 'app-event-modal',
  templateUrl: './event-modal.component.html',
  styleUrls: ['./event-modal.component.scss']
})
export class EventModalComponent{

  profileForm!:FormGroup<{
    name:FormControl<string|null>,
    location:FormControl<string|null>,
    leafletLink:FormControl<string|null>,
    startDay:FormControl<string|null>,
    endDay:FormControl<string|null>,
    galleryId:FormControl<string|null>,
  }>;

  @Input() id!: string;
  @Input() galleryId!: string;
  @Input() leafletLink!: string;
  @Input() location!: string;
  @Input() name!: string;
  @Input() participants!: string[];
  @Input() timeStart!: string;
  @Input() timeEnd!: string;

  galleries!: Observable<DocumentData[]>;
  isLoadingGallery = new BehaviorSubject(false);
  leafletFile!:File;
  oldImageAddress!:string;
  
  users!: Observable<DocumentData[]>;

  constructor(
    private readonly modalCtrl: ModalController,
    private readonly _db : AngularfireService,
    private readonly _storage : StorageService,
  ) {
    this.galleries = this._db.getGalleries();
    this.users = this._db.getUsers().pipe(map((users:DocumentData[]) => users.filter((user:DocumentData) => this.participants.includes(user['id']))))
  }

  ngOnInit(){
    this.profileForm = new FormGroup({
      name: new FormControl(this.name, Validators.required),
      location: new FormControl(this.location),
      leafletLink: new FormControl(this.leafletLink),
      startDay: new FormControl(this.timeStart),
      endDay: new FormControl(this.timeEnd),
      galleryId: new FormControl(this.galleryId),
    });
    if(!this.participants)
      this.participants = [];
  }

  confirm() {
    // this.profileForm.markAllAsTouched();

    console.log("confirm method entered",this.profileForm);
    
    if(!this.profileForm.valid)
      return;

    let entry = {
      id: this.id,
      name: this.profileForm.get('name')?.value,
      location: this.profileForm.get('location')?.value,
      leafletLink: this.profileForm.get('leafletLink')?.value,
      timeStart: this.profileForm.get('startDay')?.value,
      timeEnd: this.profileForm.get('endDay')?.value,
      galleryId: this.profileForm.get('galleryId')?.value,
      participants : this.participants,
      imageFile : this.leafletFile,
      oldImageAddress : this.oldImageAddress,
    }
    return this.modalCtrl.dismiss(entry, 'confirm');
  }

  cancel() {
    return this.modalCtrl.dismiss(undefined, 'cancel');
  }

  // get dayInputValid(): boolean {
  //   return (this.profileForm.get('startDay')?.valid && this.profileForm.get('endDay')?.valid) || false;
  // }

  async addImage(event: any) {
    this.leafletFile = event.target.files[0];
    const leafletImageUrl = URL.createObjectURL(this.leafletFile);
    
    if(this.leafletLink != undefined)
      this.oldImageAddress = this.leafletLink;

    this.leafletLink = leafletImageUrl;
  }

  debug(){
    console.log("profileForm : ",this.profileForm);
    
    console.log("profileForm value : ",this.profileForm.valid);
  }
}
