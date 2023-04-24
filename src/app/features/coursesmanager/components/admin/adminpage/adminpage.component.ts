import { Component, Input, ViewChild } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import dayjs from 'dayjs';
import { BehaviorSubject, combineLatest, firstValueFrom, map, Observable, of } from 'rxjs';
import { AngularfireService, AssoMember } from 'src/app/shared/service/angularfire.service';
import { getNowDate } from 'src/app/shared/service/hour-management.service';
import { BanmodalComponent } from '../banmodal/banmodal.component';
import { TeacherModalComponent } from '../../schedule/teacher-modal/teacher-modal.component';
import { StorageService } from 'src/app/shared/service/storage.service';
import { NewAssoMemberModalComponent } from '../new-asso-member-modal/new-asso-member-modal.component';
import { GalleryNameModalComponent } from '../gallery-name-modal/gallery-name-modal.component';
import { ModalWorkingHoursComponent } from '../modal-working-hours/modal-working-hours.component';

@Component({
  selector: 'app-adminpage',
  templateUrl: './adminpage.component.html',
  styleUrls: ['./adminpage.component.scss']
})
export class AdminpageComponent {
  constructor(
    private readonly _db:AngularfireService,
    private readonly _route: ActivatedRoute,
    private readonly _modal: ModalController,
    private readonly actionSheetCtrl: ActionSheetController,
    private readonly storage: StorageService,
    private readonly modalCtrl: ModalController,
  ) {
    this.galleries.subscribe((e:any) => { 
      this.imagesCollections = [];
      e.forEach((element:DocumentData) =>
        this.imagesCollections.push({id:element['id'],name:element['name'],images:this.storage.getGalleryImages(element['id'])})
    )})
  }

  adminData = this._route.snapshot.data['adminData'];
  
  usersListObs:Observable<DocumentData[]> = this.adminData.usersObs;
  coursesObs:Observable<DocumentData[]> = this.adminData.coursesObs;
  assoMembers = this._route.snapshot.data['adminData'].assoMembers;
  partners = this._route.snapshot.data['adminData'].partners;
  partnersData = this._route.snapshot.data['adminData'].partnersData;
  roomsData = this._route.snapshot.data['adminData'].roomsData;
  galleries = this._route.snapshot.data['adminData'].galleries as Observable<DocumentData[]>;
  @Input() activities = this._route.snapshot.data['adminData'].activities;

  searchString = "";
  statusToFilter = "all";
  timeFilter = "all";

  showUsers = new BehaviorSubject(false);
  showCourses = new BehaviorSubject(false);
  showAssoMembers = new BehaviorSubject(false);
  showActivities = new BehaviorSubject(false);

  requestsCount = this.usersListObs.pipe(
    map(usersList => usersList.filter((user:any) => user.status == 'request')),
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

  // Manage users

  manageRequests(){
    this.statusToFilter = "request";
    this.filterUsersList()
    this.showUsers.next(true);
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

  async seeWorkingHours(id:string){
    let teacher = await this._db.getUser(id);
    
    let courses = await this._db.getTeacherCoursesByMonth(id);

    const modal = await this.modalCtrl.create({
      component: ModalWorkingHoursComponent,
      componentProps: {
        teacher: teacher,
        courses: courses
      }
    });
    await modal.present();
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

  // Manage events

  async handleEvent(event:DocumentData){
    
    const result = await firstValueFrom(this.coursesObs.pipe(
      map( (courses:any) => courses.find((e:any)=> e.id == event['id'] ) ) ));
    
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
  toggle(param:BehaviorSubject<boolean>){
    param.next(!param.value);
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
    
    this.photoChanged.next(false);

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

  async updateMember(){
    let data = {id : this.memberId, name : this.memberNewName, role : this.memberNewRole, link : this.memberNewLink} as AssoMember;
    if(this.photoChanged){
      this.memberNewPhoto = await this.saveAssoMemberImage(this.imageFile);
      data.photo = this.memberNewPhoto;
    }
    this.photoChanged.next(false);
    
    this._db.updateAssoMember(data);
  }

  async createMember(){

    const modal = await this.modalCtrl.create({
      component:  NewAssoMemberModalComponent
    });
    modal.present();

    const { data,role } = await modal.onWillDismiss();

    if(role === 'confirm'){
      const photoAddress = await this.saveAssoMemberImage(data.photo);
      data.photo = photoAddress;
      this._db.addAssoMember(data);
    }
  }

  // Image management
  imageFile !: File;
  uploadingImage = new BehaviorSubject(false);
  photoChanged = new BehaviorSubject(false);
  tempImage !: any;

  async saveAssoMemberImage(imageFile : File) {

    this.uploadingImage.next(true);
    const downloadUrl = await this.storage.addMemberImage(imageFile);

    this.uploadingImage.next(false);
    return downloadUrl;
  }

  onFileSelected(event: any): void {
    this.photoChanged.next(true);
    const file: File = event.target.files[0];
    this.imageFile = file;

    this.tempImage = URL.createObjectURL(file);
  }

  // Partners management
  showPartners = new BehaviorSubject(false);
  partnerNewLink = "";
  tempImagePartner !: any;
  imageFilePartner !: File;

  createPartner(){
    (this.partnersData as {}[]).unshift({id:undefined,link:"",logoName:""})
  }
  
  deletePartner(index:number){
    if(this.partnersData[index].id == undefined){
      this.partnersData.splice(index,1)
    }else{
      this._db.deletePartner(this.partnersData[index].id);
    }
  }
  
  async restorePartner(index:number){
    this.partnersData[index].photoChanged = false;
    let partner = await firstValueFrom(this.partners);
    this.partnersData[index] = (partner as [])[index];
  }

  updatePartner(index:number){
    this._db.updatePartner({id:this.partnersData[index].id, link:this.partnersData[index].link, logoName:this.partnersData[index].logoName})
    this.partnersData[index].photoChanged = false;
  }

  onFileSelectedPartners(event: any,index : number): void {
    this.partnersData[index].photoChanged = true;
    this.imageFilePartner = event.target.files[0];

    this.tempImagePartner = URL.createObjectURL(this.imageFilePartner);
  }

  // Galleries management
  showGalleriesManager = new BehaviorSubject(false);
  isLoadingGallery = new BehaviorSubject(false);
  selectedGallery = -1;
  imagesCollections : {id:string,name:string,images:any}[] = [];
  images!:Observable<DocumentData[]>;

  async addGallery(){

    const modal = await this.modalCtrl.create({
      component:  GalleryNameModalComponent
    });
    modal.present();

    const { data,role } = await modal.onWillDismiss();

    if(role === 'confirm'){
      this.storage.createGallery(data);
    }
  }

  openGallery(galleryId:string,index:number){

    if(this.selectedGallery == index){
      // Closing the selected folder
      this.selectedGallery = -1;
      this.images = of();
      return
    }

    this.selectedGallery = index;
    
    if(!this.imagesCollections[index].images){
      this.imagesCollections[index].images = this.storage.getGalleryImages(galleryId);
    }

    this.images = this.imagesCollections[index].images;
  }

  deleteImageFromGallery(file:any){
    this.storage.deleteImageFromGallery(file);
  }

  async renameGallery(id:string){

    const modal = await this.modalCtrl.create({
      component:  GalleryNameModalComponent
    });
    modal.present();

    const { data,role } = await modal.onWillDismiss();

    if(role === 'confirm'){
      this.storage.renameGallery(id,data);
    }
  }
  
  async addImageToGallery(event:any){
    
    let data = {} as any;
    data.file = event.target.files[0];
    data.name = data.file.name;
    data.collectionId = this.imagesCollections[this.selectedGallery].id;

    this.isLoadingGallery.next(true);
    await this.storage.addImageToGallery(data);
    this.isLoadingGallery.next(false);
  }

  async deleteGallery(id:string){

    let response = await this.canDismiss();
    if(!response)
      return;

    this.storage.deleteGallery(id);
    this.selectedGallery = -1;
    this.images = of();
  }

  // Rooms management
  showRooms = new BehaviorSubject(false);
  @ViewChild('roomUpdatePopOver') popover!:any;
  showRoomConfirmation = false;

  createRoom(){
    (this.roomsData as {}[]).unshift({id:undefined, name:"",maxStudents:""})
  }

  deleteRoom(index:number){
    if(this.roomsData[index].id == undefined){
      this.roomsData.splice(index,1);
    }else{
      this._db.deleteRoom(this.roomsData[index].id);
    }
  }

  updateRoom(index:number){
    this._db.updateRoom({id:this.roomsData[index].id, name:this.roomsData[index].name, maxStudents:this.roomsData[index].maxStudents});

    this.showRoomConfirmation = true;
    setTimeout(() => {
      this.showRoomConfirmation = false;  
    }, 2000);
  }

  // Activities management

  setIconName(activity:any,name:string){
    activity.iconName = name;
  }

  createActivity(){
    (this.activities as {}[]).unshift({id:undefined,link:"",title:"",iconName:"add-circle-outline",description:""})
  }

  deleteActivity(id:string,index:number){
    this._db.deleteActivity(id);
    (this.activities as {}[]).splice(index,1);
  }

  async updateActivity(activity:any){
    if(activity.id == undefined){
      const result = await this._db.createActivity(activity);
      activity.id = result.id;
    }else{
      this._db.updateActivity(activity);
    }
  }
}
