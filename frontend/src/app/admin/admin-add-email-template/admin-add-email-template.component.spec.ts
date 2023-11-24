import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddEmailTemplateComponent } from './admin-add-email-template.component';

describe('AdminAddEmailTemplateComponent', () => {
  let component: AdminAddEmailTemplateComponent;
  let fixture: ComponentFixture<AdminAddEmailTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAddEmailTemplateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddEmailTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
