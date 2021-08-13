import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonScadaListComponent } from './json-scada-list.component';

describe('JsonScadaListComponent', () => {
    let component: JsonScadaListComponent;
    let fixture: ComponentFixture<JsonScadaListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [JsonScadaListComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JsonScadaListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
