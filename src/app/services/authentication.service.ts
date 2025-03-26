import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  onAuthStateChanged,
  UserCredential,
  sendSignInLinkToEmail,
  EmailAuthProvider,

} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  deleteDoc,
  onSnapshot
} from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.class';
import { userData } from '../types/types';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private userStatus = new BehaviorSubject<User | null>(null);
  unsubUser: () => void = () => { };
  //Wenn sich der Authentifizierungsstatus ändert (Anmeldung/Abmeldung)
  //Wird der aktuelle Benutzer (oder Gast-Benutzer) an alle Komponenten gesendet, die userStatus abonniert haben
  //Diese Komponenten können dann auf die Änderungen reagieren
  constructor(public auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await this.getFullUser();
        console.log('User:', user);
        this.userStatus.next(user || this.getGuestUser());
        //Die next()-Methode sendet einen neuen Wert an alle Observer, die dieses Subject abonniert haben

        // Echtzeit-Listener für Benutzerdokument starten
        this.setupUserDocListener(firebaseUser.uid);
      } else {
        this.userStatus.next(this.getGuestUser());
      }
    });
  }

  setupUserDocListener(userId: string) {
    const userRef = doc(this.firestore, `users/${userId}`);
    // onSnapshot gibt eine Cleanup-Funktion zurück
    this.unsubUser = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data() as userData;
        const user = new User({
          id: docSnapshot.id,
          ...userData
        });

        console.log('Benutzerdaten aktualisiert:', user);
        this.userStatus.next(user);
      }
    }, (error) => {
      console.error('Fehler beim Überwachen des Benutzerdokuments:', error);
    });
  }

  ngOnDestroy() {
    this.unsubUser();
  }


  signUp(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  signIn(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signOut(): Promise<void> {
    let currentUser = this.auth.currentUser;

    if (currentUser && currentUser.isAnonymous) {
      try {
        let userRef = doc(this.firestore, `users/${currentUser.uid}`);
        await signOut(this.auth);
        await deleteDoc(userRef);
        await currentUser.delete();

      } catch (error) {
        console.error('Fehler beim Löschen des anonymen Benutzers:', error);
      }
    }

    await signOut(this.auth);
  }

  // signInWithGoogle() {
  //   const provider = new GoogleAuthProvider();
  //   return signInWithPopup(this.auth, provider);
  // }

  saveUserData(uid: string, userData: any) {
    const userRef = doc(this.firestore, `users/${uid}`);
    return setDoc(userRef, userData, { merge: true });
  }

  updateUserData(uid: string, updatedData: Partial<User>) {
    let userRef = doc(this.firestore, `users/${uid}`);
    return updateDoc(userRef, updatedData);
  }

  getUserStatus() {
    return this.userStatus.asObservable();
  }

  getUserId(): string | null {
    return this.auth.currentUser?.uid || null;
  }

  // async getPendingEmail(userId: string): Promise<string | null> {
  //   let userDocRef = doc(this.firestore, `users/${userId}`);
  //   let userDoc = await getDoc(userDocRef);

  //   if (userDoc.exists()) {
  //     let userData = userDoc.data();
  //     return userData['pendingEmail'] || null;
  //   } else {
  //     return null;
  //   }
  // }

  // async getUserByPendingEmail(email: string): Promise<User | null> {
  //   const usersCollection = collection(this.firestore, 'users');
  //   const emailQuery = query(
  //     usersCollection,
  //     where('pendingEmail', '==', email)
  //   );
  //   const querySnapshot = await getDocs(emailQuery);

  //   if (!querySnapshot.empty) {
  //     const userDoc = querySnapshot.docs[0];
  //     const userData = userDoc.data() as userData;
  //     return new User({ id: userDoc.id, ...userData });
  //   }
  //   return null;
  // }

  async getFullUser(): Promise<User | null> {
    const currentUser: FirebaseUser | null = this.auth.currentUser;

    if (!currentUser) {
      return null;
    }

    try {
      const userRef = doc(this.firestore, `users/${currentUser.uid}`);
      const userSnap = await getDoc(userRef);
      const userFirestoreData = userSnap.data() as userData | undefined;

      const userData: userData = {
        id: currentUser.uid,
        email: currentUser.email ?? '',
        firstName: userFirestoreData?.firstName ?? '',
        lastName: userFirestoreData?.lastName ?? '',
        role: userFirestoreData?.role ?? '',
        weeklyWorkingHours: userFirestoreData?.weeklyWorkingHours ?? 0,
      };
      this.saveUserData(currentUser.uid, userData); //new
      return new User(userData);
    } catch (error) {
      console.error('Fehler beim Abrufen des Benutzerprofils:', error);
      return this.getGuestUser();
    }
  }

  private getGuestUser(): User {
    return new User({
      id: 'guest',
      firstName: 'Guest',
      lastName: 'User',
      email: '',
      role: 'guest',
      weeklyWorkingHours: 40,
    });
  }

  // async setOnlineStatus(isOnline: boolean): Promise<void> {
  //   const currentUser: FirebaseUser | null = this.auth.currentUser;

  //   if (!currentUser) {
  //     console.warn(
  //       'Kein Benutzer eingeloggt. Onlinestatus kann nicht gesetzt werden.'
  //     );
  //     return;
  //   }

  //   try {
  //     const userRef = doc(this.firestore, `users/${currentUser.uid}`);
  //     const userSnap = await getDoc(userRef);

  //     if (userSnap.exists()) {
  //       await setDoc(
  //         userRef,
  //         {
  //           isOnline: isOnline,
  //         },
  //         { merge: true }
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Fehler beim Setzen des Onlinestatus:', error);
  //   }
  // }





}
