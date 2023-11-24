import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUploadReportsComponent } from './admin-upload-reports.component';

describe('AdminUploadReportsComponent', () => {
  let component: AdminUploadReportsComponent;
  let fixture: ComponentFixture<AdminUploadReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminUploadReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminUploadReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
