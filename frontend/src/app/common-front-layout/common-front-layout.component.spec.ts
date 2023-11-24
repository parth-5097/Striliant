import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonFrontLayoutComponent } from './common-front-layout.component';

describe('CommonFrontLayoutComponent', () => {
  let component: CommonFrontLayoutComponent;
  let fixture: ComponentFixture<CommonFrontLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonFrontLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonFrontLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
