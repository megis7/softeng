import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrouwdsourceComponent } from './crouwdsource.component';

describe('CrouwdsourceComponent', () => {
  let component: CrouwdsourceComponent;
  let fixture: ComponentFixture<CrouwdsourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrouwdsourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrouwdsourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
