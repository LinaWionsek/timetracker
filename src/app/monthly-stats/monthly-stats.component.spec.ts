import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyStatsComponent } from './monthly-stats.component';

describe('MonthlyStatsComponent', () => {
  let component: MonthlyStatsComponent;
  let fixture: ComponentFixture<MonthlyStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyStatsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MonthlyStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
