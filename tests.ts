import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);


let time1 = "2023-03-24T12:00:00+01:00"
let time11 = "2023-03-24T14:00:00+01:00"

// exactement pareil (vrai)
let time4 = "2023-03-24T12:00:00+01:00"
let time41 = "2023-03-24T14:00:00+01:00"

// collé devant (faux)
let time5 = "2023-03-24T11:00:00+01:00"
let time51 = "2023-03-24T12:00:00+01:00"

// englobe autour (vrai)
let time6 = "2023-03-24T11:00:00+01:00"
let time61 = "2023-03-24T15:00:00+01:00"

// a cheval sur l'arrière (vrai)
let time7 = "2023-03-24T13:00:00+01:00"
let time71 = "2023-03-24T15:00:00+01:00"

// Collé derrière (faux)
let time8 = "2023-03-24T14:00:00+01:00"
let time81 = "2023-03-24T15:00:00+01:00"

// au milieu (vrai)
let time9 = "2023-03-24T12:30:00+01:00"
let time91 = "2023-03-24T13:30:00+01:00"

// devant (faux)
let timeA = "2023-03-24T10:00:00+01:00"
let timeA1 = "2023-03-24T11:00:00+01:00"

// derrière (faux)
let timeB = "2023-03-24T15:00:00+01:00"
let timeB1 = "2023-03-24T16:00:00+01:00"

let time2 = "2023-03-24T11:00:00.000Z"
let time21 = "2023-03-24T13:00:00.000Z"
let time3 = "2023-03-24T11:00:00+02:00"
let time31 = "2023-03-24T13:00:00+02:00"

console.log("diff : ",dayjs(time11).diff(time1,"minute"));
console.log("collision 1 and 2-21",isColliding(time1,time11,time2,time21));
console.log("collision 1 and 3-31",isColliding(time1,time11,time3,time31));

console.log("collision 1 and 4-41 (true)",isColliding(time1,time11,time4,time41)==true);
console.log("collision 1 and 5-51 (false)",isColliding(time1,time11,time5,time51)==false);
console.log("collision 1 and 6-61 (true)",isColliding(time1,time11,time6,time61)==true);
console.log("collision 1 and 7-71 (true)",isColliding(time1,time11,time7,time71)==true);
console.log("collision 1 and 8-81 (false)",isColliding(time1,time11,time8,time81)==false);
console.log("collision 1 and 9-91 (true)",isColliding(time1,time11,time9,time91)==true);
console.log("collision 1 and A-A1 (false)",isColliding(time1,time11,timeA,timeA1)==false);
console.log("collision 1 and B-B1 (false)",isColliding(time1,time11,timeB,timeB1)==false);



function isColliding(startTime1:string, endTime1:string ,startTime2:string, endTime2:string){
    if(dayjs(startTime1).isBetween(startTime2,endTime2,'minutes','[)')) return true;  // 1 starts in 2
    if(dayjs(endTime1).isBetween(startTime2,endTime2,'minutes','(]')) return true;    // 1 ends in 2
    if(dayjs(startTime2).isBetween(startTime1,endTime1,'minutes','[)'))return true;   // 2 starts in 1
    return false;
}