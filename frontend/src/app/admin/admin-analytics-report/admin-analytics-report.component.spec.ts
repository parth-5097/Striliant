import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAnalyticsReportComponent } from './admin-analytics-report.component';

describe('AdminAnalyticsReportComponent', () => {
  let component: AdminAnalyticsReportComponent;
  let fixture: ComponentFixture<AdminAnalyticsReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAnalyticsReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAnalyticsReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
