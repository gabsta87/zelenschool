import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentData } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-centers-page',
  templateUrl: './centers-page.component.html',
  styleUrls: ['./centers-page.component.scss']
})
export class CentersPageComponent {

  assoCenters:Observable<DocumentData[]> = this._route.snapshot.data['assoCenters'];
  
  constructor(private readonly _route: ActivatedRoute){ }

}
