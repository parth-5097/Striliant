import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEmailTemplatesComponent } from './admin-email-templates.component';

describe('AdminEmailTemplatesComponent', () => {
  let component: AdminEmailTemplatesComponent;
  let fixture: ComponentFixture<AdminEmailTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminEmailTemplatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEmailTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
