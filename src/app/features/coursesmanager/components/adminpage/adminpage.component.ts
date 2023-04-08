import { Component } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import * as dayjs from 'dayjs';
import { BehaviorSubject, combineLatest, count, filter, find, firstValueFrom, map, Observable } from 'rxjs';
import { AngularfireService } from 'src/app/shared/service/angularfire.service';
import { getNowDate } from 'src/app/shared/service/hour-management.service';
import { BanmodalComponent } from '../banmodal/banmodal.component';
import { TeacherModalComponent } from '../teacher-modal/teacher-modal.component';

@Component({
  selector: 'app-adminpage',
  templateUrl: './adminpage.component.html',
  styleUrls: ['./adminpage.component.scss']
})
export class AdminpageComponent {
  constructor(
    private readonly _db:AngularfireService,
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    private readonly _modal: ModalController,
    private readonly actionSheetCtrl: ActionSheetController
  ) {}

  async ionViewDidEnter(){
    console.log("asso : ",this.assoMembers);
    
  }

  adminData = this._route.snapshot.data['adminData'];
  
  usersListObs:Observable<DocumentData[]> = this.adminData.usersObs;
  coursesObs:Observable<DocumentData[]> = this.adminData.coursesObs;
  assoMembers = this._route.snapshot.data['adminData'].assoMembers;
  partners = this._route.snapshot.data['adminData'].partners;

  searchString = "";
  statusToFilter = "all";
  timeFilter = "all";

  showUsers = new BehaviorSubject(false);
  showCourses = new BehaviorSubject(false);
  showAssoMembers = new BehaviorSubject(false);

  requestsCount = this.usersListObs.pipe(
    map(usersList =>usersList.filter((user:any) => user.status == 'request')),
    map(filteredUsers => filteredUsers.length)
  )
  
  search = new BehaviorSubject("");
  filterUsersActivated = new BehaviorSubject("all");
  filterCoursesActivated = new BehaviorSubject("all");

  filteredDataObs = combineLatest([
    this.search.asObservable(),
    this.usersListObs,
    this.coursesObs,
    this.filterUsersActivated.asObservable(),
    this.filterCoursesActivated.asObservable(),
  ]).pipe(
    map(([searchString, users, courses, usersFilter, coursesFilter]) => {

      if(searchString == "" && usersFilter == "all" && coursesFilter == "all")
          return [users,courses];

      switch(usersFilter){
        case "all":
          break;
        case "ban":
          users = users.filter ((e:any) => e.ban != undefined)
          break;
        default:
          users = users.filter( (user:any) => user.status == usersFilter )
          break;
      }

      switch(coursesFilter){
        case "all":
          break;
        case "future":
          courses = courses.filter((course:any) => dayjs(course.timeStart).isAfter(dayjs(getNowDate())) )
          break;
        case "past":
          courses = courses.filter((course:any) => dayjs(course.timeStart).isBefore(dayjs(getNowDate())) )
          break;
        default:
          break;
      }

      const filteredUsers = users.filter((user:any) => 
        user.f_name.toLowerCase().includes(searchString.toLowerCase()) ||
        user.l_name.toLowerCase().includes(searchString.toLowerCase())
      );
      const filteredCourses = courses.filter((course:any) =>
        course.description?.toLowerCase().includes(searchString.toLowerCase()) ||
        course.title.toLowerCase().includes(searchString.toLowerCase()) ||
        course.author.l_name.toLowerCase().includes(searchString.toLocaleLowerCase()) ||
        course.author.f_name.toLowerCase().includes(searchString.toLocaleLowerCase()) ||
        course.attendantsId.find((e:any) => 
          e.l_name.toLowerCase().includes(searchString.toLowerCase()) ||
          e.f_name.toLowerCase().includes(searchString.toLowerCase())
        )
      );
      return [filteredUsers, filteredCourses];
    })
  );

  updateSearchValue(){
    this.search.next(this.searchString);
  }

  filterRequests(){
    this.statusToFilter = "request";
  }

  filterUsersList(){
    this.filterUsersActivated.next(this.statusToFilter);
  }

  filterCoursesList(){
    this.filterCoursesActivated.next(this.timeFilter);
  }

  async banUser(id:string){

    const modal = await this._modal.create({
      component:BanmodalComponent
    })
    modal.present();

    const { data,role } = await modal.onWillDismiss();

    if(role == "confirm")
      this._db.banUser(id,data);

  }

  async deleteUser(id:string){

    let response = await this.canDismiss();
    if(!response)
      return;

    this._db.removeUser(id);
    return this._modal.dismiss(null, 'delete');
  }


  canDismiss = async () => {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'Delete',
          role: 'confirm',
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    actionSheet.present();

    const { role } = await actionSheet.onWillDismiss();

    return role === 'confirm';
  };

  acceptRequest(id:string){
    this._db.acceptRequest(id);
  }

  unbanUser(id:string){
    this._db.unbanUser(id);
  }

  addPartner(){
    this._router.navigate(['/imageUpload/']);
  }

  addMember(){
    this._router.navigate(['/imageUpload/']);
  }

  addPhotoToGallery(){
    this._router.navigate(['/imageUpload/']);
  }

  async handleEvent(event:DocumentData){
    console.log("event : ",event);
    
    const result = await firstValueFrom(this.coursesObs.pipe(
      map( (courses:any) => courses.find((e:any)=> e.id == event['id'] ) ) ));
    console.log("result = ",result);
    
    if(result == undefined)
      return
    
    const modal = await this._modal.create({
      component: TeacherModalComponent,
      componentProps: {
        meta : {
          id : result.id,
          room_id : result.room_id,
          timeStart : result.timeStart,
          timeEnd : result.timeEnd,
          max_participants : result.max_participants,
          description : result.description,
        },
        title: result.title,
      },
    });
      
    modal.present();
  }

  // Display lists
  toggleUsers(){
    this.showUsers.next(!this.showUsers.value);
  }
  toggleCourses(){
    this.showCourses.next(!this.showCourses.value);
  }
  toggleAsso(){
    this.showAssoMembers.next(!this.showAssoMembers.value);
  }

  // Asso Members management
  editingMember = new BehaviorSubject(false);
  memberId = "";
  memberNewName = "";
  memberNewRole = "";
  memberNewLink = "";
  memberNewPhoto = "";
  currentMember!: {id:string,name:string,role:string,link:string,photo:string}; 

  async editMember(id:string){
    this.editingMember.next(true);
    this.currentMember = await firstValueFrom(this.assoMembers.pipe(map( (e:any) => e.find( (member:any) => member.id == id))))
    
    this.memberId = id;
    this.memberNewName = this.currentMember.name;
    this.memberNewRole = this.currentMember.role;
    this.memberNewLink = this.currentMember.link;
    this.memberNewPhoto= this.currentMember.photo;
  }

  deleteMember(id:string){
    this._db.deleteAssoMember(id);
  }

  cancelMemberEdit(){
    this.editingMember.next(false);
  }

  updateMember(){
    this._db.updateAssoMember({id : this.memberId, role : this.memberNewRole, name : this.memberNewName, photo : this.memberNewPhoto})
  }

  setImageLink(){
    // TODO
    console.log("TODO");
  }

  createMember(){
    // TODO
    console.log("TODO");
  }
}
