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
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

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

  getTimerecords() {
    const timerecordsCollection = collection(this.firestore, 'timerecords');
    this.timerecords$ = collectionData(timerecordsCollection) as Observable<Timerecords[]>;
    return this.timerecords$;
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

}
