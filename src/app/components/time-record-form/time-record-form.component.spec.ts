import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeRecordFormComponent } from './time-record-form.component';

describe('TimeRecordFormComponent', () => {
  let component: TimeRecordFormComponent;
  let fixture: ComponentFixture<TimeRecordFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeRecordFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimeRecordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
