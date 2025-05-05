import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { combineLatest, filter, map, take } from 'rxjs';
import { DataStoreServiceService } from '../services/data-store-service.service';
import { AuthenticationService } from '../services/authentication.service';

export const dataLoadedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthenticationService);
  const dataService = inject(DataStoreServiceService);

  return combineLatest([
    authService.getUserStatus(), //Observable of current user (null if not logged in)
    dataService.timerecords$ //Observable of loaded time records
  ]).pipe(
     // ⛔ Wait until both user and time records are loaded
    filter(([user, records]) => !!user && records.length > 0), // Double negation: ensures user is truthy (not null/undefined)
    take(1), // Only take the first valid result, then complete
    map(() => true)  // Allow access to the route
  );
};
