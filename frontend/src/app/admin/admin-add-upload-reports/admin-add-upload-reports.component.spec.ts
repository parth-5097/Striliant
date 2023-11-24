import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddUploadReportsComponent } from './admin-add-upload-reports.component';

describe('AdminAddUploadReportsComponent', () => {
  let component: AdminAddUploadReportsComponent;
  let fixture: ComponentFixture<AdminAddUploadReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAddUploadReportsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddUploadReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
