import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMilestonesComponent } from './admin-milestones.component';

describe('AdminMilestonesComponent', () => {
  let component: AdminMilestonesComponent;
  let fixture: ComponentFixture<AdminMilestonesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminMilestonesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminMilestonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
