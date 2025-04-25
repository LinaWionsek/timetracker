import { Injectable, inject } from '@angular/core';
import { Timerecords } from '../models/timerecords.class';
import {
  DocumentData,
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
  getDocs,
  query,
  addDoc,
  where,
  onSnapshot,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user.class';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class DataStoreServiceService {

  startQuickTimes = ['07:00', '08:00', '09:00', '10:00', '11:00'];
  endQuickTimes = ['12:00', '13:00', '14:15', '15:00', '16:00', '17:00', '18:00'];
  breakDurations: number[] = [0, 30, 45, 60]
  firestore: Firestore = inject(Firestore);
  timerecords$!: Observable<Timerecords[]>;

  constructor() { }


  async safeData(daten: Timerecords) {
    await addDoc(collection(this.firestore, 'timerecords'), daten.toJSON())
      .catch((err) => { console.log(err) })
      .then((docRef) => { console.log('Document written with ID: ', docRef?.id); });
  }


  //.pipe() heißt: "Bevor ich die Daten weitergebe, will ich noch etwas damit machen."
  // Map: Für jedes Dokument (User-Datensatz) ...
  //... baue eine neue Instanz deiner eigenen User-Klasse daraus!


  getAllUsers() {
    const usersRef = collection(this.firestore, 'users');
    return collectionData(usersRef, { idField: 'id' }).pipe(
      map(data => data.map(user => new User(user as User)))
    );
  }

  getTimerecords() {
    const timerecordsCollection = collection(this.firestore, 'timerecords');
    this.timerecords$ = collectionData(timerecordsCollection, { idField: 'id' }) as Observable<Timerecords[]>;
    return this.timerecords$;
  }
  async updateData(daten: Timerecords) {
    const docRef = doc(this.firestore, 'timerecords', daten.id);
    await updateDoc(docRef, daten.toJSON()).catch((err) => { console.log(err) });
  }

  async findByDate(searchDate: Date) {
    const dateString = searchDate.toISOString();
    const q = query(
      collection(this.firestore, 'timerecords'),
      where('date', '==', dateString)
    );

    const querySnapshot = await getDocs(q);
    // Nehme das erste (und vermutlich einzige) Dokument
    const doc = querySnapshot.docs[0];
    if (doc) {
      return doc.data() as Timerecords;
    }
    return null; // oder undefined, je nachdem was du bevorzugst
  }

  async deleteTimerecord(daten: Timerecords) {
    const docRef = doc(this.firestore, 'timerecords', daten.id);
    await deleteDoc(docRef).catch((err) => { console.log(err) });
  }
}
