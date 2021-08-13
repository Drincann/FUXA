import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { from, Observable } from 'rxjs';
import { GaugeDialogType } from '../../gauges/gauge-property/gauge-property.component';

import { SelOptionsComponent } from '../../gui-helpers/sel-options/sel-options.component';
import { sha256 } from 'hash.js'
import { GaugeProperty, GaugeSettings, Hmi, View } from '../../_models/hmi';
import { UserGroups } from '../../_models/user';
import { generateJsonScadaSvg } from '../../_utils';

interface SvgInfo { filename: string, SHA256HashHex: string, birthtime: number }
interface SvgInfoInView { filename: string, filenameInView: string, viewName: string }
interface GETsvg {
    data: SvgInfo[];
    error: boolean;
    message: string;
}
@Component({
    selector: 'json-scada-list',
    templateUrl: './json-scada-list.component.html',
    styleUrls: ['./json-scada-list.component.css']
})
export class JsonScadaListComponent implements OnInit {
    svgList: SvgInfo[] = [];

    // 与视图绑定
    svgListInView: SvgInfoInView[] = [];

    changeRecord: SvgInfoInView[] = [];

    viewNames: string[] = [];
    viewMap: { [hash: string]: View } = {};
    jsonScadaSvgMap: { [filename: string]: string } = {};

    apiRoot = window.location.protocol + "//" + window.location.hostname + ":8080/svgManagerApi"


    constructor(public dialog: MatDialog,
        public dialogRef: MatDialogRef<JsonScadaListComponent>,
        private http: HttpClient,
        @Inject(MAT_DIALOG_DATA) public data: {
            title: string;
            views: View[];
        }) {
        this.data.views.forEach((view) => {
            const jsonScadaSvg = generateJsonScadaSvg(view);
            const hash = sha256().update(jsonScadaSvg).digest('hex');
            this.viewMap[hash] = view;
            this.jsonScadaSvgMap[view.name] = jsonScadaSvg;
        });
        this.viewNames = this.data.views.map(view => view.name);
    }

    ngOnInit() {
        this.refreshSvgListInView();
    }

    async refreshSvgListInView(): Promise<void> {
        try {
            const result = await this.http.get<GETsvg>(this.apiRoot + '/svg').toPromise()
            if (!result.error) {
                this.svgList = result.data;
                this.svgListInView = result.data.map(svgInfo => ({
                    filename: svgInfo.filename,
                    filenameInView: svgInfo.filename,
                    viewName: this.viewMap[svgInfo.SHA256HashHex] == null ? undefined : this.viewMap[svgInfo.SHA256HashHex].name,
                }));
            }
        } catch (e) {
            console.log(e);
        }
    }


    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.dialogRef.close();
    }

    addJsonScadaView(): void {
        this.svgListInView.push({ filename: '', filenameInView: '', viewName: '' });
    }

    async removeJsonScadaView(index: number): Promise<void> {
        if (this.svgListInView[index].viewName != '' && this.svgListInView[index].filenameInView != '') {
            try { await this.http.delete(this.apiRoot + '/svg', { params: { filename: this.svgListInView[index].filename } }).toPromise() }
            catch (e) {/* ignore */ }
        }
        setTimeout(() => { this.refreshSvgListInView(); }, 500);
    }

    private isIn(partOfObj, objArr): boolean {
        for (const ele of objArr) {
            let match = true;
            for (const conditionField in partOfObj) {
                if (!(ele[conditionField] == partOfObj[conditionField])) {
                    match = false;
                    break;
                }
            }
            if (!match) {
                continue;
            }
            return true;
        }
        return false;
    }

    async onSvgViewSelectorChange(index: number) {
        if (this.svgListInView[index].viewName != '' && this.svgListInView[index].filenameInView != '') {
            const filename = this.svgListInView[index].filename;
            const filenameInView = this.svgListInView[index].filenameInView;
            try {
                if (this.isIn({ filename }, this.svgList)) {
                    // update
                    await this.http.put(this.apiRoot + '/svg', { filename, updater: { fileContent: this.jsonScadaSvgMap[this.svgListInView[index].viewName] } }).toPromise()
                } else {
                    // post
                    await this.http.post(this.apiRoot + '/svg', { filename: filenameInView, fileContent: this.jsonScadaSvgMap[this.svgListInView[index].viewName] }).toPromise()
                }
            } catch (error) {/* ignore */ }
            setTimeout(() => { this.refreshSvgListInView(); }, 500);
        }
    }

    async onFilenameBlur(index: number) {
        if (this.svgListInView[index].viewName != '' && this.svgListInView[index].filenameInView != '') {
            const oldFilename = this.svgListInView[index].filename;
            try {
                if (this.isIn({ filename: oldFilename }, this.svgList)) {
                    // update
                    await this.http.put(this.apiRoot + '/svg', { filename: oldFilename, updater: { filename: this.svgListInView[index].filenameInView } }).toPromise()
                } else {
                    // post
                    await this.http.post(this.apiRoot + '/svg', { filename: this.svgListInView[index].filenameInView, fileContent: this.jsonScadaSvgMap[this.svgListInView[index].viewName] }).toPromise()
                }
            } catch (error) {/* ignore */ }
            setTimeout(() => { this.refreshSvgListInView(); }, 500);
        }
    }
}
