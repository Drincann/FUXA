/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SldShapesComponent } from './sld-shapes.component';

describe('SldShapesComponent', () => {
  let component: SldShapesComponent;
  let fixture: ComponentFixture<SldShapesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SldShapesComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SldShapesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
