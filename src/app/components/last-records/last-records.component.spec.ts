import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastRecordsComponent } from './last-records.component';

describe('LastRecordsComponent', () => {
  let component: LastRecordsComponent;
  let fixture: ComponentFixture<LastRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LastRecordsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LastRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
