import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { bdValidator, dayValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-day-input',
  templateUrl: './day-input.component.html',
  styleUrls: ['./day-input.component.scss']
})
export class DayInputComponent {
  
  profileForm!:FormGroup<{
    day:FormControl<string|null>,
  }>;

  constructor(){
    this.profileForm = new FormGroup({
      day: new FormControl('',
              dayValidator(),
            )}) ;
  }

  onInput(ev:any) {
    const value = ev.target!.value;
    
    // Removes non alphanumeric characters
    const numeric = value.replace(/[^\d./]/, "");

    // Inserts dots
    const correctedValue = numeric.replace(/(?<=^\d{2})(\d)/g, ".$1");
    const correctedSecondLevel = correctedValue.replace(/(?<=^\d{2}\.\d{2})(\d)/g, ".$1");

    // Blocks extra characters
    const truncatedValue = correctedSecondLevel.replace(/(?<=(?:^\d{2}[./]\d{2}[./]\d{4}))./g,"")

    /**
     * Update both the state variable and
     * the component to keep them in sync.
     */
    ev.target.value = truncatedValue;
    this.profileForm.get("day")?.setValue(truncatedValue);
  }
}
