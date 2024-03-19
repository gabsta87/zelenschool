import { Component, EventEmitter, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-image-input',
  templateUrl: './image-input.component.html',
  styleUrls: ['./image-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageInputComponent),
      multi: true
    }
  ]
})
export class ImageInputComponent implements ControlValueAccessor {
  @Output() imageFileChange = new EventEmitter<File>();

  private onChange: Function | undefined;
  private onTouched: Function | undefined;

  constructor() { }

  writeValue(obj: any): void {
    // Cette méthode est appelée par Angular lorsque la valeur du contrôle doit être mise à jour depuis le modèle
    // Vous pouvez implémenter le comportement nécessaire pour mettre à jour votre composant en fonction de la valeur fournie
    // Par exemple, vous pouvez afficher une image à partir de l'URL ou du fichier fourni
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  imageSource!:string;
  imageFile!:File;

  loadImage($event:any){
    this.imageFile =  $event.target.files[0];
    this.imageSource = URL.createObjectURL(this.imageFile);;

    this.imageFileChange.emit(this.imageFile);
  }
}
