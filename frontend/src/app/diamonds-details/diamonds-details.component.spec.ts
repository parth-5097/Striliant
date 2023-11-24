import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiamondsDetailsComponent } from './diamonds-details.component';

describe('DiamondsDetailsComponent', () => {
  let component: DiamondsDetailsComponent;
  let fixture: ComponentFixture<DiamondsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiamondsDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DiamondsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
