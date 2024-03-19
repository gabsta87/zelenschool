import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { dayValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-project-modal',
  templateUrl: './project-modal.component.html',
  styleUrls: ['./project-modal.component.scss']
})
export class ProjectModalComponent {

  profileForm!:FormGroup<{
    name:FormControl<string|null>,
    author:FormControl<string|null>,
    description:FormControl<string|null>,
    date:FormControl<string|null>,
    type:FormControl<string|null>,
    imgLink:FormControl<string|null>,
  }>;
  
  @Input() id!: string;
  @Input() name!: string;
  @Input() author!: string;
  @Input() date!: string;
  @Input() description!: string;
  @Input() imgLink!: string;
  @Input() type!: string;
  imageFile!:File;
  oldImageAddress!:string;
  isLoadingGallery = new BehaviorSubject(false);

  constructor(
    private readonly modalCtrl: ModalController,
  ) { }

  ngOnInit(){
    this.profileForm = new FormGroup({
      name: new FormControl(this.name, Validators.required),
      author: new FormControl(this.author),
      description: new FormControl(this.description),
      date: new FormControl(this.date,dayValidator()),
      type: new FormControl(this.type),
      imgLink: new FormControl(this.imgLink),
    });
  }

  confirm() {
    let entry = {
      id: this.id,
      name: this.profileForm.get('name')?.value,
      author: this.profileForm.get('author')?.value,
      date: this.profileForm.get('date')?.value,
      description: this.profileForm.get('description')?.value,
      imgLink: this.profileForm.get('imgLink')?.value,
      type: this.profileForm.get('type')?.value,
      oldImageAddress : this.oldImageAddress,
      imgFile : this.imageFile,
    }
    return this.modalCtrl.dismiss(entry, 'confirm');
  }

  cancel() {
    return this.modalCtrl.dismiss(undefined, 'cancel');
  }

  onImageFileChange(newImageFile: File) {
    this.imageFile = newImageFile;
    const newImageURL = URL.createObjectURL(this.imageFile);

    if(this.imgLink != undefined)
      this.oldImageAddress = this.imgLink;

    this.profileForm.get('imgLink')?.setValue(newImageURL);
  }

  async addImage(event: any) {
    this.imageFile = event.target.files[0];
    const leafletImageUrl = URL.createObjectURL(this.imageFile);
    
    if(this.imgLink != undefined)
      this.oldImageAddress = this.imgLink;

    this.imgLink = leafletImageUrl;
  }
}
