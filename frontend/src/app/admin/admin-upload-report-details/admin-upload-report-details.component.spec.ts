import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUploadReportDetailsComponent } from './admin-upload-report-details.component';

describe('AdminUploadReportDetailsComponent', () => {
  let component: AdminUploadReportDetailsComponent;
  let fixture: ComponentFixture<AdminUploadReportDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminUploadReportDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminUploadReportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
