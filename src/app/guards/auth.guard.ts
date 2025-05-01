import { CanActivateFn, Router,  } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { inject } from '@angular/core';
import { combineLatest, map, take, filter } from 'rxjs';

export const authGuard: CanActivateFn = () => {
    // 🔧 Services injizieren (funktional, ohne Constructor)
  const authService = inject(AuthenticationService);
  const router = inject(Router);


  return combineLatest([
    authService.getAuthChecked(), // ← sagt uns: Firebase hat seinen Job getan
    authService.getUserStatus()  // ← liefert Benutzer (oder null)
  ]).pipe(
    // ✅ Erst reagieren, wenn Auth geprüft wurde
    filter(([checked, _]) => checked), //blockiert alles, bis Firebase geprüft hat
    // ✅ Jetzt auf genau einen geprüften Wert reagieren
    take(1), // wartet dann auf den ersten gültigen Zustand
    map(([_, user]) => {
      if (user) {
        return true; // ✅ Zugriff erlaubt
      } else {
        return router.parseUrl('/login'); // ❌ Weiterleitung
      }
    })
  );

};

