import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAnalyticsDashboardsComponent } from './admin-analytics-dashboards.component';

describe('AdminAnalyticsDashboardsComponent', () => {
  let component: AdminAnalyticsDashboardsComponent;
  let fixture: ComponentFixture<AdminAnalyticsDashboardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAnalyticsDashboardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAnalyticsDashboardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
