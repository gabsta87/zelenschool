import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-project-modal',
  templateUrl: './project-modal.component.html',
  styleUrls: ['./project-modal.component.scss']
})
export class ProjectModalComponent {

  id!: string;
  name!: string;
  author!: string;
  date!: string;
  description!: string;
  imgLink!: string;
  type!: string;

  constructor(
    private readonly modalCtrl: ModalController,
  ) { }

  confirm() {
    let entry = {
      id: this.id ? this.id : "",
      name: this.name,
      author: this.author ? this.author : "",
      date: this.date ? this.date : "",
      description: this.description ? this.description : "",
      imgLink: this.imgLink ? this.imgLink : "",
      type: this.type ? this.type : "",
    }

    return this.modalCtrl.dismiss(entry, 'confirm');
  }

  cancel() {
    return this.modalCtrl.dismiss(undefined, 'cancel');
  }
}
