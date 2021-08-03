import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexJsonScadaComponent } from './flex-json-scada.component';

describe('FlexJsonScadaComponent', () => {
  let component: FlexJsonScadaComponent;
  let fixture: ComponentFixture<FlexJsonScadaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FlexJsonScadaComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlexJsonScadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
