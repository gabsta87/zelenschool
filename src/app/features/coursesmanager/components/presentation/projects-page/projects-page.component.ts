import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentData } from 'firebase/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-projects-page',
  templateUrl: './projects-page.component.html',
  styleUrls: ['./projects-page.component.scss']
})
export class ProjectsPageComponent {

  projectsObs:Observable<DocumentData[]> = this._route.snapshot.data['assoProjects'];
  
  constructor(private readonly _route: ActivatedRoute){ }

}
