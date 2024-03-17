import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { dayValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-day-input',
  templateUrl: './day-input.component.html',
  styleUrls: ['./day-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DayInputComponent),
      multi: true
    }
  ]
})
export class DayInputComponent implements ControlValueAccessor{
  
  profileForm!:FormGroup<{
    day:FormControl<string|null>,
  }>;

  constructor(){
    this.profileForm = new FormGroup({
      day: new FormControl('',
              dayValidator(),
            )}) ;
  }

  writeValue(obj: any): void {
    this.profileForm.get("day")?.setValue(obj);
  }

  registerOnChange(fn: any): void {
    this.profileForm.get("day")?.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.profileForm.get("day")?.valueChanges.subscribe(fn);
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.profileForm.disable();
    } else {
      this.profileForm.enable();
    }
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
