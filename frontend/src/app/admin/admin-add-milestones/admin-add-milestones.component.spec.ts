import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddMilestonesComponent } from './admin-add-milestones.component';

describe('AdminAddMilestonesComponent', () => {
  let component: AdminAddMilestonesComponent;
  let fixture: ComponentFixture<AdminAddMilestonesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAddMilestonesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddMilestonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
