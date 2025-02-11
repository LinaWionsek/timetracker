import { TestBed } from '@angular/core/testing';

import { DataStoreServiceService } from './data-store-service.service';

describe('DataStoreServiceService', () => {
  let service: DataStoreServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataStoreServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
