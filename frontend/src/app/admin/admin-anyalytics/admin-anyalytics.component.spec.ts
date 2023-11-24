import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAnyalyticsComponent } from './admin-anyalytics.component';

describe('AdminAnyalyticsComponent', () => {
  let component: AdminAnyalyticsComponent;
  let fixture: ComponentFixture<AdminAnyalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAnyalyticsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAnyalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
