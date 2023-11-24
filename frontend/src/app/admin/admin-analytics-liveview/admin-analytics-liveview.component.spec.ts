import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAnalyticsLiveviewComponent } from './admin-analytics-liveview.component';

describe('AdminAnalyticsLiveviewComponent', () => {
  let component: AdminAnalyticsLiveviewComponent;
  let fixture: ComponentFixture<AdminAnalyticsLiveviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAnalyticsLiveviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAnalyticsLiveviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
