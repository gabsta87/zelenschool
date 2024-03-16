import { Component } from '@angular/core';
import { DocumentData } from 'firebase/firestore';

@Component({
  selector: 'app-asso-event-popover',
  templateUrl: './asso-event-popover.component.html',
  styleUrls: ['./asso-event-popover.component.scss']
})
export class AssoEventPopoverComponent {
  assoEvent!:DocumentData;
}
