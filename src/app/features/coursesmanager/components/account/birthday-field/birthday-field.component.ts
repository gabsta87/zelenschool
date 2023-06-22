import { Component, EventEmitter, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { bdValidator } from 'src/app/shared/service/validators-lib.service';

@Component({
  selector: 'app-birthday-field',
  templateUrl: './birthday-field.component.html',
  styleUrls: ['./birthday-field.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: forwardRef(() => BirthdayFieldComponent)
  }]
})
export class BirthdayFieldComponent implements ControlValueAccessor {

  onChange = (value: string) => {};

  writeValue(obj: string): void { }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: string): void { }
  setDisabledState?(isDisabled: boolean): void { }

  onTouched = () => {};

  b_day:FormControl<string|null> = new FormControl("",bdValidator());

  @Output()
  change: EventEmitter<string> = new EventEmitter<string>();

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
    this.b_day.get("b_day")?.setValue(truncatedValue);
    this.change.emit(truncatedValue);
    this.onChange(truncatedValue);
  }
}
