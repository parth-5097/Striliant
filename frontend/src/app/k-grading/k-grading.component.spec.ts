import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KGradingComponent } from './k-grading.component';

describe('KGradingComponent', () => {
  let component: KGradingComponent;
  let fixture: ComponentFixture<KGradingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KGradingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KGradingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
