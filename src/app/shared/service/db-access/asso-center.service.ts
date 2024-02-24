import { Injectable } from '@angular/core';
import { DocumentData, Firestore, addDoc, collection, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { MainAccessService } from './main-access.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssoCenterService {

  constructor(
    private readonly _dbaccess:Firestore,
    private readonly _mainAccess : MainAccessService,
    ) { }

  // Asso Center

  async getAssoCenters():Promise<Observable<DocumentData[]>>{
    const centers = await this._mainAccess.getElements("assoCenter");
    return centers;
  }

  getAssoCenter(id:string){
    const center = this._mainAccess.getSnapshot("assoCenter",id);
    return center;
  }

  getAssoCenterObs(id:string){
    const center = this._mainAccess.getElements("assoCenter",where("id","==",id));
    return center;
  }

  updateAssoCenter(newValue:{id:string,name?:string,location?:string,contactPerson?:string,contactPhone?:string,contactPhotoLink?:string,rooms?:string[],openingHours?:string[]}){
    if(!newValue.id || newValue.id == ""){
      return addDoc(collection(this._dbaccess,"assoCenter"),{...newValue})
    }else{
      // Removing the ID property from the new value
      const { id, ...strippedValue } = newValue;

      const docRef = doc(this._dbaccess,'assoCenter/'+newValue.id);
      return updateDoc(docRef,strippedValue);
    }
  }
  
  async deleteAssoCenter(id:string){
    const center = await this.getAssoCenter(id);

    // Deleting rooms of the center
    if(center){
      const rooms = center['rooms'];
      rooms.forEach((roomID:string) => {
        const docRef = doc(this._dbaccess,'rooms/'+roomID);
        deleteDoc(docRef);
      })
    }

    const docRef = doc(this._dbaccess,'assoCenter/'+id);
    deleteDoc(docRef);
  }

  async deleteDayScedule(assoCenterID:string,index:number){
    const center = await this.getAssoCenter(assoCenterID);

    if(center){
      const schedules = center['openingHours'];
      schedules.splice(index,1);
      
      return this.updateAssoCenter({id:assoCenterID,openingHours:schedules})
    }
  }

    // Rooms management
    getRooms(){
      return this._mainAccess.getElements("rooms");
    }
  
    getRoom(id:string){
      const room = this._mainAccess.getSnapshot("rooms",id);
      return room;
    }
  
    async updateRoom(room : {id: string, name: string, maxStudents: number, assoCenterID:string}){
      
      if(!room.id || room.id == ""){
        // Creating a new room
        const result = await addDoc(collection(this._dbaccess,"rooms"),{ name: room.name, maxStudents: room.maxStudents, assoCenter : room.assoCenterID})
        
        // Adding the room reference in the Association Center
        const center = await this.getAssoCenter(room.assoCenterID);
        let newArray;
        if(center && center['rooms']){
          newArray = [...center['rooms'],result.id]
        }else{
          newArray = [result.id];
        }
        this.updateAssoCenter({id:room.assoCenterID,rooms:newArray})
  
        return result;
      }else{
        // Adding a new room
        const docRef = doc(this._dbaccess,'rooms/'+room.id);
        
        return updateDoc(docRef,{name : room.name, maxStudents : room.maxStudents, assoCenter : room.assoCenterID});
      }
    }
  
    async deleteRoom(id:string){
      const room = await this.getRoom(id);
      
      // Removing room from assoCenter
      if(room){
        const center = await this.getAssoCenter(room['assoCenter']);
        
        if(center){
          const rooms = center['rooms']; 
          const newRooms = rooms.filter((roomId:string) => roomId != id)
          
          this.updateAssoCenter({id:center['id'],rooms:newRooms})
        }
      }
      
      const docRef = doc(this._dbaccess,'rooms/'+id);
      deleteDoc(docRef);
    }
  
}
