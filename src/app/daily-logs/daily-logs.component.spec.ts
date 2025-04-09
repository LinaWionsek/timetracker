import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyLogsComponent } from './daily-logs.component';

describe('DailyLogsComponent', () => {
  let component: DailyLogsComponent;
  let fixture: ComponentFixture<DailyLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyLogsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DailyLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
