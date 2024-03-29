import { Component, ViewChild } from '@angular/core';
import { DocumentData } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController, ModalController } from '@ionic/angular';
import dayjs from 'dayjs';
import { BehaviorSubject, Observable, combineLatest, firstValueFrom, map, of } from 'rxjs';
import { AngularfireService, AssoMember } from 'src/app/shared/service/angularfire.service';
import { getNowDate } from 'src/app/shared/service/hour-management.service';
import { StorageService } from 'src/app/shared/service/storage.service';
import { UsermanagementService } from 'src/app/shared/service/usermanagement.service';
import { TeacherModalComponent } from '../../schedule/teacher-modal/teacher-modal.component';
import { BanModalComponent } from '../ban-modal/ban-modal.component';
import { CenterOpeningHourModalComponent } from '../center-opening-hour-modal/center-opening-hour-modal.component';
import { EventModalComponent } from '../event-modal/event-modal.component';
import { GalleryNameModalComponent } from '../gallery-name-modal/gallery-name-modal.component';
import { ModalWorkingHoursComponent } from '../modal-working-hours/modal-working-hours.component';
import { AssoCenterModalComponent } from '../asso-center-modal/asso-center-modal.component';
import { NewAssoMemberModalComponent } from '../new-asso-member-modal/new-asso-member-modal.component';
import { NewRoomModalComponent } from '../new-room-modal/new-room-modal.component';
import { PartnerModalComponent } from '../partner-modal/partner-modal.component';
import { ProjectModalComponent } from '../project-modal/project-modal.component';

@Component({
  selector: 'app-adminpage',
  templateUrl: './adminpage.component.html',
  styleUrls: ['./adminpage.component.scss']
})
export class AdminpageComponent {
  constructor(
    private readonly _db: AngularfireService,
    private readonly _route: ActivatedRoute,
    private readonly actionSheetCtrl: ActionSheetController,
    private readonly storage: StorageService,
    private readonly _modalCtrl: ModalController,
    private readonly _user: UsermanagementService,
  ) {
    this.galleries.subscribe((e: any) => {
      this.imagesCollections = [];
      e.forEach((element: DocumentData) =>
        this.imagesCollections.push({ id: element['id'], name: element['name'], images: this.storage.getGalleryImages(element['id']) })
      )
    })
  }

  adminData = this._route.snapshot.data['adminData'];

  usersListObs: Observable<DocumentData[]> = this.adminData.usersObs;
  coursesObs: Observable<DocumentData[]> = this.adminData.coursesObs;
  assoMembers = this.adminData.assoMembers;
  partners: Observable<DocumentData[]> = this.adminData.partners;
  partnersData = this.adminData.partnersData;
  roomsData = this.adminData.roomsData;
  roomsObs: Observable<DocumentData[]> = this.adminData.rooms;
  galleries = this.adminData.galleries as Observable<DocumentData[]>;
  // @Input() activities = this.adminData.activities;
  assoCenters:Observable<DocumentData[]> = this._route.snapshot.data['assoCenters'];
  assoProjects:Observable<DocumentData[]> = this._route.snapshot.data['assoProjects'];
  assoEvents:Observable<DocumentData[]> = this._route.snapshot.data['assoEvents'];

  searchString = "";
  statusToFilter = "all";
  timeFilter = "all";

  showUsers = new BehaviorSubject(false);
  showCourses = new BehaviorSubject(false);
  showAssoMembers = new BehaviorSubject(false);
  showProjects = new BehaviorSubject(false);
  showEvents = new BehaviorSubject(false);
  // showActivities = new BehaviorSubject(false);

  isSuperAdmin = this._user.isLoggedAsSuperAdmin;

  requestsCount = this.usersListObs.pipe(
    map(usersList => usersList.filter((user: any) => user.status == 'request')),
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

      if (searchString == "" && usersFilter == "all" && coursesFilter == "all")
        return [users, courses];

      switch (usersFilter) {
        case "all":
          break;
        case "ban":
          users = users.filter((e: any) => e.ban != undefined)
          break;
        default:
          users = users.filter((user: any) => user.status.includes(usersFilter))
          break;
      }

      switch (coursesFilter) {
        case "all":
          break;
        case "future":
          courses = courses.filter((course: any) => dayjs(course.timeStart).isAfter(dayjs(getNowDate())))
          break;
        case "past":
          courses = courses.filter((course: any) => dayjs(course.timeStart).isBefore(dayjs(getNowDate())))
          break;
        default:
          break;
      }

      const filteredUsers = users.filter((user: any) =>
        user.f_name.toLowerCase().includes(searchString.toLowerCase()) ||
        user.l_name.toLowerCase().includes(searchString.toLowerCase())
      );

      const filteredCourses = courses.filter((course: any) =>
        course.description?.toLowerCase().includes(searchString.toLowerCase()) ||
        course.title.toLowerCase().includes(searchString.toLowerCase()) ||
        course.author.l_name.toLowerCase().includes(searchString.toLocaleLowerCase()) ||
        course.author.f_name.toLowerCase().includes(searchString.toLocaleLowerCase()) ||
        course.attendants.find((e: any) =>
          e && (
            e.l_name.toLowerCase().includes(searchString.toLowerCase()) ||
            e.f_name.toLowerCase().includes(searchString.toLowerCase())
          )
        )
      );
      return [filteredUsers, filteredCourses];
    })
  );

  updateSearchValue() {
    this.search.next(this.searchString);
  }

  // Manage users

  manageRequests() {
    this.statusToFilter = "request";
    this.filterUsersList()
    this.showUsers.next(true);
  }

  filterUsersList() {
    this.filterUsersActivated.next(this.statusToFilter);
  }

  filterCoursesList() {
    this.filterCoursesActivated.next(this.timeFilter);
  }

  async banUser(id: string) {

    const modal = await this._modalCtrl.create({
      component: BanModalComponent
    })
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role == "confirm")
      this._db.banUser(id, data);

  }

  async deleteUser(id: string) {

    let response = await this.canDismiss();
    if (!response)
      return;

    this._db.removeUser(id);
    return this._modalCtrl.dismiss(null, 'delete');
  }

  async seeWorkingHours(id: string) {
    let teacher = await this._db.getUser(id);

    let courses = await this._db.getTeacherCoursesByMonth(id);

    const modal = await this._modalCtrl.create({
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

  acceptRequest(id: string) {
    this._db.acceptRequest(id);
  }

  unbanUser(id: string) {
    this._db.unbanUser(id);
  }

  private async modifyAdmin(id: string, newStatus: string) {
    let newValue = { status: newStatus, }
    this._db.setUser(id, newValue);
  }

  async promoteAdmin(id: string) {
    this.modifyAdmin(id, "admin");
  }

  async revokeAdmin(id: string) {
    this.modifyAdmin(id, "teacher")
  }

  async promoteSuperAdmin(id: string) {
    this.modifyAdmin(id, "superadmin");
  }

  async revokeSuperAdmin(id: string) {
    this.modifyAdmin(id, "admin");
  }

  // Manage events

  async handleEvent(event: DocumentData) {

    const result = await firstValueFrom(this.coursesObs.pipe(
      map((courses: any) => courses.find((e: any) => e.id == event['id']))));

    if (result == undefined)
      return

    const modal = await this._modalCtrl.create({
      component: TeacherModalComponent,
      componentProps: {
        meta: {
          id: result.id,
          room_id: result.room_id,
          timeStart: result.timeStart,
          timeEnd: result.timeEnd,
          max_participants: result.max_participants,
          description: result.description,
        },
        title: result.title,
      },
    });

    modal.present();
  }

  // Display lists
  toggle(param: BehaviorSubject<boolean>) {
    param.next(!param.value);
  }

  // Asso Members management
  editingMember = new BehaviorSubject(false);
  memberId = "";
  memberNewName = "";
  memberNewRole = "";
  memberNewLink = "";
  memberNewPhoto = "";
  currentMember!: { id: string, name: string, role: string, link: string, photo: string };

  async editMember(id: string) {
    this.editingMember.next(true);
    this.currentMember = await firstValueFrom(this.assoMembers.pipe(map((e: any) => e.find((member: any) => member.id == id))))

    this.photoChanged.next(false);

    this.memberId = id;
    this.memberNewName = this.currentMember.name;
    this.memberNewRole = this.currentMember.role;
    this.memberNewLink = this.currentMember.link;
    this.memberNewPhoto = this.currentMember.photo;
  }

  deleteMember(id: string) {
    this._db.deleteAssoMember(id);
  }

  cancelMemberEdit() {
    this.editingMember.next(false);
  }

  async updateMember() {
    let data = { id: this.memberId, name: this.memberNewName, role: this.memberNewRole, link: this.memberNewLink } as AssoMember;
    
    if (this.photoChanged.value) {
      this.memberNewPhoto = await this.saveAssoMemberImage(this.imageFile);
      data.photo = this.memberNewPhoto;
    }
    this.photoChanged.next(false);

    this._db.updateAssoMember(data);
  }

  async createMember() {

    const modal = await this._modalCtrl.create({
      component: NewAssoMemberModalComponent
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
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

  async saveAssoEventImage(imageFile: File) {
    this.uploadingImage.next(true);
    const downloadUrl = await this.storage.addEventImage(imageFile);

    this.uploadingImage.next(false);
    return downloadUrl;
  }
  
  async saveAssoCenterImage(imageFile: File) {
    this.uploadingImage.next(true);
    const downloadUrl = await this.storage.addCenterImage(imageFile);

    this.uploadingImage.next(false);
    return downloadUrl;
  }

  async saveProjectImage(imageFile: File) {
    this.uploadingImage.next(true);
    const downloadUrl = await this.storage.addProjectImage(imageFile);

    this.uploadingImage.next(false);
    return downloadUrl;
  }

  async saveAssoMemberImage(imageFile: File) {
    this.uploadingImage.next(true);
    const downloadUrl = await this.storage.addMemberImage(imageFile);

    this.uploadingImage.next(false);
    return downloadUrl;
  }

  async savePartnerImage(imageFile: File) {
    this.uploadingImage.next(true);
    const downloadUrl = await this.storage.addPartnerImage(imageFile);

    this.uploadingImage.next(false);
    return downloadUrl;
  }

  onFileSelected(event: any): string {
    this.photoChanged.next(true);
    const file: File = event.target.files[0];
    this.imageFile = file;

    this.tempImage = URL.createObjectURL(file);
    return URL.createObjectURL(file);
  }

  // Partners management
  showPartners = new BehaviorSubject(false);
  partnerNewLink = "";
  tempImagePartner !: any;
  imageFilePartner !: File;

  async createPartner() {

    const modal = await this._modalCtrl.create({
      component: PartnerModalComponent
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      const photoAddress = await this.savePartnerImage(data.logoName);
      this._db.writePartner({logoName:photoAddress,link:data.link,name:data.logoName.name});
    }
  }

  deletePartner(partner:DocumentData) {
    this.storage.deleteImageFromGallery({id:partner['id'],link:partner['logoName'],collection:"partners",name:partner['name']})
    this._db.deletePartner(partner);
  }

  async restorePartner(index: number) {
    this.partnersData[index].photoChanged = false;
    let partner = await firstValueFrom(this.partners);
    this.partnersData[index] = (partner as [])[index];
  }

  // updatePartner(partner:DocumentData) {
  //   this._db.updatePartner({ id: partner['id'], link: this.partnersData[index].link, logoName: this.partnersData[index].logoName })
  //   this.partnersData[index].photoChanged = false;
  // }

  onFileSelectedPartners(event: any, index: number): void {
    this.partnersData[index].photoChanged = true;
    this.imageFilePartner = event.target.files[0];

    this.tempImagePartner = URL.createObjectURL(this.imageFilePartner);
  }

  // Galleries management
  showGalleriesManager = new BehaviorSubject(false);
  isLoadingGallery = new BehaviorSubject(false);
  selectedGallery = -1;
  imagesCollections: { id: string, name: string, images: any }[] = [];
  images!: Observable<DocumentData[]>;

  async addGallery() {

    const modal = await this._modalCtrl.create({
      component: GalleryNameModalComponent
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.storage.createGallery(data);
    }
  }

  openGallery(galleryId: string, index: number) {

    if (this.selectedGallery == index) {
      // Closing the selected folder
      this.selectedGallery = -1;
      this.images = of();
      return
    }

    this.selectedGallery = index;

    if (!this.imagesCollections[index].images) {
      this.imagesCollections[index].images = this.storage.getGalleryImages(galleryId);
    }

    this.images = this.imagesCollections[index].images;
  }

  deleteImageFromGallery(file: any) {
    this.storage.deleteImageFromGallery(file);
  }

  async renameGallery(id: string) {

    const modal = await this._modalCtrl.create({
      component: GalleryNameModalComponent
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      this.storage.renameGallery(id, data);
    }
  }

  async addImageToGallery(event: any) {

    let data = {} as any;
    data.file = event.target.files[0];
    data.name = data.file.name;
    data.collectionId = this.imagesCollections[this.selectedGallery].id;

    this.isLoadingGallery.next(true);
    await this.storage.addImageToGallery(data);
    this.isLoadingGallery.next(false);
  }

  async deleteGallery(id: string) {

    let response = await this.canDismiss();
    if (!response)
      return;

    this.storage.deleteGallery(id);
    this.selectedGallery = -1;
    this.images = of();
  }

  // Rooms management
  showRooms = new BehaviorSubject(false);
  @ViewChild('roomUpdatePopOver') popover!: any;
  showRoomConfirmation = false;

  async openRoomModal(centerData:DocumentData,roomData?:DocumentData) {
    console.log("center data : ", centerData);
    

    let modal;
    if(roomData){
      modal = await this._modalCtrl.create({
      component:NewRoomModalComponent,
      componentProps:{
          id:roomData['id'],
          name:roomData['name'], 
          maxSudents:roomData['maxSudents'],
          assoCenterData :centerData,
        }
      })

    }else{
      modal = await this._modalCtrl.create({
        component:NewRoomModalComponent,
        componentProps:{
          assoCenterData :centerData,
        }
      })
    }

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    console.log("data : ",data);
    

    if(role == "confirm")
      this._db.updateRoom(data);
  }

  deleteRoomByIndex(index: number) {
    if (this.roomsData[index].id == undefined) {
      this.roomsData.splice(index, 1);
    } else {
      this._db.deleteRoom(this.roomsData[index].id);
    }
  }

  deleteRoom(id:string){
    if(id != undefined && id != "")
      this._db.deleteRoom(id);
  }

  // Asso Centers management

  async openCenterCreationModal(inputData?:DocumentData){
    let modal;
    if(inputData){
      const assoCentersObs = await this._db.getAssoCenters();
      modal = await this._modalCtrl.create({
      component:AssoCenterModalComponent,
      componentProps:{
          id:inputData['id'],
          name:inputData['name'], 
          location:inputData['location'],
          centerPhotoLink : inputData['centerPhotoLink'],
          contactPerson:inputData['contactPerson'], 
          contactPhone:inputData['contactPhone'], 
          contactMail:inputData['contactMail'], 
          contactPhotoLink:inputData['contactPhotoLink'], 
          openingHours:inputData['openingHours'],
          openingHoursObs : assoCentersObs.pipe(map ((assoCenters:any) => assoCenters.find((center:any) => center['id'] == inputData['id'])['openingHours'])),
          rooms:inputData['rooms'],
          roomsData : this.roomsData.filter((roomData:any) => inputData['rooms'].includes(roomData.id)),
          roomsObs : this.roomsObs.pipe(map (rooms =>  rooms.filter((roomData:any) => inputData['rooms'].includes(roomData.id)) )
          ),
        }
      })

    }else{
      modal = await this._modalCtrl.create({
        component:AssoCenterModalComponent,
      })
    }

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if(role == "confirm"){
      if(data.imageFile){
        const photoAddress = await this.saveAssoCenterImage(data.imageFile);
        data.centerPhotoLink = photoAddress;
        if(data.oldImageAddress)
          this.storage.deleteImageFromURL(data.oldImageAddress);
      }
      this._db.updateAssoCenter(data);
    }

  }

  async deleteAssoCenter(id:string){
    let response = await this.canDismiss();
    if (!response)
      return;

    this._db.deleteAssoCenter(id);
  }

  async addDaySchedule(assoCenterID:string){
    const center = await this._db.getAssoCenter(assoCenterID);

    let modal = await this._modalCtrl.create({
      component:CenterOpeningHourModalComponent
    })

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if(role == "confirm"){
      this._db.updateAssoCenter({id:assoCenterID})

      if(center){
        const schedules = center['openingHours'];
        let finalSchedules = [...schedules,data];
        
        return this._db.updateAssoCenter({id:assoCenterID,openingHours:finalSchedules})
      }
    }

  }

  // Events management
  async createEvent(){
    const modal = await this._modalCtrl.create({
      component: EventModalComponent
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      const photoAddress = await this.saveAssoEventImage(data.photo);
      data.photo = photoAddress;
      this._db.createAssoEvent(data);
    }
  }

  async deleteEvent(id:string){
    let response = await this.canDismiss();
    if (!response)
      return;

    let assoEvt = await this._db.getAssoEvent(id);
    if(assoEvt && assoEvt['leafletLink'])
      this.storage.deleteImageFromURL(assoEvt['leafletLink']);

    this._db.deleteAssoEvent(id);
  }

  async editEvent(event:DocumentData){
    const modal = await this._modalCtrl.create({
      component: EventModalComponent ,
      componentProps: {
        id:event['id'],
        galleryId:event['galleryId'],
        leafletLink:event['leafletLink'],
        location:event['location'],
        name:event['name'],
        participants:event['participants'],
        timeEnd:event['timeEnd'],
        timeStart:event['timeStart'],
      },
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      if(data.imageFile){
        const photoAddress = await this.saveAssoEventImage(data.imageFile);
        data.leafletLink = photoAddress;
        if(data.oldImageAddress)
          this.storage.deleteImageFromURL(data.oldImageAddress);
      }
      this._db.updateAssoEvent(data);
    }
  }

  // Projects management
  async createProject(){
    const modal = await this._modalCtrl.create({
      component: ProjectModalComponent
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'confirm') {
      console.log("data : ",data);
      if(data.imgFile){
        const photoAddress = await this.saveProjectImage(data.imgFile);
        data.imgLink = photoAddress;
      }
      
      this._db.createAssoProject(data);
    }
  }

  async deleteProject(id:string){
    let response = await this.canDismiss();
    if (!response)
      return;

    let assoProject = await this._db.getAssoProject(id);
    if(assoProject && assoProject['imgLink'])
      this.storage.deleteImageFromURL(assoProject['imgLink']);

    this._db.deleteAssoProject(id);
  }

  async editProject(project:DocumentData){
    const modal = await this._modalCtrl.create({
      component: ProjectModalComponent ,
      componentProps: {
        id:project['id'],
        author:project['author'],
        date:project['date'],
        description:project['description'],
        imgLink:project['imgLink'],
        name:project['name'],
        type:project['type'],
      },
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'confirm') {
      
      if(data.imgFile){
        const photoAddress = await this.saveProjectImage(data.imgFile);
        data.imgLink = photoAddress;

        if(data.oldImageAddress)
          this.storage.deleteImageFromURL(data.oldImageAddress);
        
      }
      this._db.updateAssoProject(data);
    }
  }
}
