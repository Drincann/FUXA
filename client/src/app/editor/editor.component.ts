﻿import { Component, Inject, OnInit, OnDestroy, AfterViewInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, ElementRef } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ProjectService } from '../_services/project.service';
import { Hmi, View, GaugeSettings, SelElement, LayoutSettings, ViewType, CardWidget, CardWidgetType } from '../_models/hmi';
import { WindowRef } from '../_helpers/windowref';
import { Output } from '@angular/core/src/metadata/directives';
import { GaugePropertyComponent, GaugeDialogType } from '../gauges/gauge-property/gauge-property.component';
import { ChartPropertyComponent } from '../gauges/controls/html-chart/chart-property/chart-property.component';

import { GaugesManager } from '../gauges/gauges.component';
import { GaugeBaseComponent } from '../gauges/gauge-base/gauge-base.component'
import { Utils } from '../_helpers/utils';
import { ConfirmDialogComponent } from '../gui-helpers/confirm-dialog/confirm-dialog.component';
import { Define } from '../_helpers/define';

import * as FileSaver from 'file-saver';
import { BagPropertyComponent } from '../gauges/controls/html-bag/bag-property/bag-property.component';
import { PipePropertyComponent } from '../gauges/controls/pipe/pipe-property/pipe-property.component';
import { SliderPropertyComponent } from '../gauges/controls/slider/slider-property/slider-property.component';
import { HtmlInputComponent } from '../gauges/controls/html-input/html-input.component';
import { HtmlButtonComponent } from '../gauges/controls/html-button/html-button.component';
import { HtmlSelectComponent } from '../gauges/controls/html-select/html-select.component';
import { ValueComponent } from '../gauges/controls/value/value.component';
import { GaugeProgressComponent } from '../gauges/controls/gauge-progress/gauge-progress.component';
import { GaugeSemaphoreComponent } from '../gauges/controls/gauge-semaphore/gauge-semaphore.component';
import { HtmlSwitchPropertyComponent } from '../gauges/controls/html-switch/html-switch-property/html-switch-property.component';

import { GridsterItem } from 'angular-gridster2';
import { CardConfigComponent } from './card-config/card-config.component';
import { CardsViewComponent } from '../cards-view/cards-view.component';
import { generateJsonScadaSvg } from '../_utils';

declare var Gauge: any;

declare var $: any;
declare var svgEditor: any;
declare var mypathseg: any;         ///< svg-editor component
declare var initPathSeg: any;
declare var mybrowser: any;
declare var initBrowser: any;
declare var mysvgutils: any;
declare var initSvgutils: any;
declare var myselect: any;
declare var initSelect: any;
declare var mydraw: any;
declare var initDraw: any;
declare var mylocal: any;
declare var initLocale: any;
declare var mycontextmenu: any;
declare var initContextmenu: any;
declare var mysvgcanvas: any;
declare var initSvgCanvas: any;
declare var mysvgeditor: any;
declare var initSvgEditor: any;

@Component({
    moduleId: module.id,
    templateUrl: 'editor.component.html',
    styleUrls: ['editor.component.css']
})

export class EditorComponent implements OnInit, AfterViewInit, OnDestroy {
    // currentUser: User;
    // users: User[] = [];
    // @ViewChild('fillcolor') fillcolor: ElementRef;
    @ViewChild('gaugepanel') gaugePanelComponent: GaugeBaseComponent;
    @ViewChild('viewFileImportInput') viewFileImportInput: any;
    @ViewChild('cardsview') cardsview: CardsViewComponent;

    readonly colorDefault = { fill: '#FFFFFF', stroke: '#000000' };

    fonts = Define.fonts;
    isLoading = true;
    editorModeType = EditorModeType;
    editorMode: EditorModeType = EditorModeType.SVG;
    defaultColor = Utils.defaultColor;
    colorFill = this.colorDefault.fill;
    colorStroke = this.colorDefault.stroke;
    currentView: View = null;
    hmi: Hmi = new Hmi();// = {_id: '', name: '', networktype: '', ipaddress: '', maskaddress: '' };
    currentMode = '';
    imagefile: string;
    gridOn: boolean = false;
    selectedElement: SelElement = new SelElement();
    panelsState = {
        enabled: false,
        panelView: true,
        panelGeneral: true,
        panelC: true,
        panelD: true,
        panelS: true
    };
    panelPropertyIdOpenState: boolean;
    panelPropertyTransformOpenState: boolean;
    panelAlignOpenState: boolean;
    panelFillOpenState: boolean;
    panelEventOpenState: boolean;
    panelMarkerOpenState: boolean;
    panelHyperlinkOpenState: boolean;

    dashboard: Array<GridsterItem>;
    cardViewType = Utils.getEnumKey(ViewType, ViewType.cards);

    shapesGrps = [];
    private gaugesRef = [];

    private subscriptionSave: Subscription;
    private subscriptionLoad: Subscription;

    constructor(private projectService: ProjectService,
        private winRef: WindowRef,
        public dialog: MatDialog,
        private changeDetector: ChangeDetectorRef,
        private translateService: TranslateService,
        private gaugesManager: GaugesManager,
        private viewContainerRef: ViewContainerRef,
        private resolver: ComponentFactoryResolver,
        private mdIconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
        mdIconRegistry.addSvgIcon('group', sanitizer.bypassSecurityTrustResourceUrl('/assets/images/group.svg'));
        mdIconRegistry.addSvgIcon('to_bottom', sanitizer.bypassSecurityTrustResourceUrl('/assets/images/to-bottom.svg'));
        mdIconRegistry.addSvgIcon('to_top', sanitizer.bypassSecurityTrustResourceUrl('/assets/images/to-top.svg'));

        // this.gaugesManager.stopDemo();
    }

    //#region Implemented onInit / onAfterInit event
    /**
     * Init Save Project event and clear gauge memory (to manage event signal/gauge)
     */
    ngOnInit() {
        try {
            this.subscriptionSave = this.projectService.onSaveCurrent.subscribe(saveas => {
                this.onSaveProject();
                if (saveas) {
                    this.projectService.saveAs();
                }
            });
            this.gaugesManager.clearMemory();
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * after init event
     */
    ngAfterViewInit() {
        this.myInit();
        this.setMode('select');
        let hmi = this.projectService.getHmi();
        if (hmi) {
            this.loadHmi();
        }
        this.subscriptionLoad = this.projectService.onLoadHmi.subscribe(load => {
            this.loadHmi();
        }, error => {
            console.log('Error loadHMI');
        });
        this.changeDetector.detectChanges();
    }

    ngOnDestroy() {
        try {
            if (this.subscriptionSave) {
                this.subscriptionSave.unsubscribe();
            }
            if (this.subscriptionLoad) {
                this.subscriptionLoad.unsubscribe();
            }
        } catch (e) {
        }
        this.onSaveProject();
    }
    //#endregion

    //#region General private function
    /**
     * Init, first init the svg-editor component
     */
    private myInit() {
        try {
            // first init svg-editor component
            mypathseg.initPathSeg();
            mybrowser.initBrowser();
            mysvgutils.initSvgutils();
            myselect.initSelect();
            mydraw.initDraw();
            mysvgcanvas.initSvgCanvas();
            // init svg-editor
            let toinit = mysvgeditor.initSvgEditor($,
                (selected) => {
                    this.onSelectedElement(selected);
                    let ga: GaugeSettings = this.getGaugeSettings(selected);
                },
                (type, args) => {
                    this.onExtensionLoaded(args);
                    this.clearSelection();
                    if (type === 'shapes') {
                        this.setShapes();
                    }
                },
                (type, color) => {
                    if (type === 'fill') {
                        this.colorFill = color;
                        this.setFillColor(this.colorFill);
                        this.checkMySelectedToSetColor(this.colorFill, null, this.winRef.nativeWindow.svgEditor.getSelectedElements());
                        // console.log('fill ' + color);
                    } else if (type === 'stroke') {
                        this.colorStroke = color;
                        this.checkMySelectedToSetColor(null, this.colorStroke, this.winRef.nativeWindow.svgEditor.getSelectedElements());
                        // console.log('stroke ' + color);
                    }
                },
                (eleadded) => {
                    console.log('added: ' + eleadded.id + ' ' + eleadded.type);
                    let ga: GaugeSettings = this.getGaugeSettings(eleadded);
                    this.checkGaugeAdded(ga);
                    // this.hmiService.addGauge(this.hmi, eleadded);
                },
                (eleremoved) => {
                    this.onRemoveElement(eleremoved);
                },
                (eleresized) => {
                    if (eleresized && eleresized.id) {
                        let ga: GaugeSettings = this.getGaugeSettings(eleresized);
                        this.gaugesManager.checkElementToResize(ga, this.resolver, this.viewContainerRef);
                    }
                },
                (copiedpasted) => {
                    if (copiedpasted && copiedpasted.copy && copiedpasted.past) {
                        copiedpasted.copy = copiedpasted.copy.filter(function (e) { return e });
                        if (copiedpasted.copy.length == copiedpasted.past.length) {
                            for (let i = 0; i < copiedpasted.copy.length; i++) {
                                let srctype = copiedpasted.copy[i].getAttribute("type");
                                let srcid = copiedpasted.copy[i].getAttribute("id");
                                if (srcid && srctype) {
                                    let gasrc: GaugeSettings = this.searchGaugeSettings({ id: srcid, type: srctype });
                                    let gadest: GaugeSettings = this.gaugesManager.createSettings(copiedpasted.past[i].id, gasrc.type);
                                    gadest.property = JSON.parse(JSON.stringify(gasrc.property));
                                    this.setGaugeSettings(gadest);
                                    this.checkGaugeAdded(gadest);
                                }
                            }
                        }
                    }
                }
            );

            this.winRef.nativeWindow.svgEditor.init();
            $(initContextmenu);

        } catch (err) {
            console.log(err);
        }
        this.setFillColor(this.colorFill);
        this.setFillColor(this.colorStroke);
    }

    /**
     * Load the hmi resource and bind it
     */
    private loadHmi() {
        this.currentView = null;
        this.hmi = this.projectService.getHmi();
        // check new hmi
        if (!this.hmi.views || this.hmi.views.length <= 0) {
            this.hmi.views = [];
            this.addView();
            // this.selectView(this.hmi.views[0].name);
        } else {
            let oldsel = localStorage.getItem("@frango.webeditor.currentview");
            if (!oldsel && this.hmi.views.length) {
                oldsel = this.hmi.views[0].name;
            }
            for (let i = 0; i < this.hmi.views.length; i++) {
                if (this.hmi.views[i].name === oldsel) {
                    this.onSelectView(this.hmi.views[i]);
                    break;
                }
            }
        }
        this.loadPanelState();
        this.isLoading = false;
    }

    /**
     * Set or Add the View to Project
     * Save the View to Server
     */
    private saveView(view: View) {
        this.projectService.setView(view);
    }

    /**
     * Remove the View from Project
     * Remove the View from Server
     * @param view
     */
    private removeView(view: View) {
        this.projectService.removeView(view);
    }

    private getContent() {
        if (this.currentView.type === Utils.getEnumKey(ViewType, ViewType.cards)) {
            this.currentView.svgcontent = this.cardsview.getContent();
            return this.currentView.svgcontent;
            // let temp = JSON.parse(JSON.stringify(this.dashboard));
            // for (let i = 0; i < temp.length; i++) {
            //     delete temp[i]['content'];
            //     delete temp[i]['background'];
            // }
            // return JSON.stringify(temp);
        } else {
            return this.winRef.nativeWindow.svgEditor.getSvgString();
        }
    }

    /**
     * Take shapes from svg-editor to show in panel
     */
    private setShapes() {
        let temp = this.winRef.nativeWindow.svgEditor.getShapes();
        let grps = [];
        Object.keys(temp).forEach(grpk => {
            grps.push({ name: grpk, shapes: temp[grpk] });
        }),
            this.shapesGrps = grps;
    }

    /**
     * get gauge settings from current view items, if not exist create void settings from GaugesManager
     * @param ele gauge id
     */
    private getGaugeSettings(ele) {
        if (ele && this.currentView) {
            if (this.currentView.items[ele.id]) {
                return this.currentView.items[ele.id];
            }
            return this.gaugesManager.createSettings(ele.id, ele.type);
        }
        return null;
    }

    /**
     * search gauge settings on all views items, if not exist create void settings from GaugesManager
     * @param ele gauge element
     */
    private searchGaugeSettings(ele) {
        if (ele) {
            if (this.currentView) {
                if (this.currentView.items[ele.id]) {
                    return this.currentView.items[ele.id];
                }
            }
            for (var i = 0; i < this.hmi.views.length; i++) {
                if (this.hmi.views[i].items[ele.id]) {
                    return this.hmi.views[i].items[ele.id];
                }
            }
            return this.gaugesManager.createSettings(ele.id, ele.type);
        }
        return null;
    }

    /**
     * add the gauge settings to the current view items list
     * @param ga GaugeSettings
     */
    private setGaugeSettings(ga) {
        this.currentView.items[ga.id] = ga;
    }

    /**
     * check the gauge in current view of element
     * @param ele element to check
     */
    private checkGaugeInView(ele) {
        let g = this.getGaugeSettings(ele);
        if (!g) {

        }
    }

    /**
     * check and set the color panel with selected element
     * @param ele selected element
     */
    private checkColors(ele) {
        let eles = this.winRef.nativeWindow.svgEditor.getSelectedElements();
        let clrfill = null;
        let clrstroke = null;
        if (eles && (eles.length <= 1 || !eles[1]) && eles[0]) {
            // check for gauge fill and stroke color
            let colors = { fill: clrfill, stroke: clrstroke };
            if (GaugesManager.checkGaugeColor(ele, eles, colors)) {
                if (colors.fill) {
                    this.colorFill = colors.fill;
                }
                if (colors.stroke) {
                    this.colorStroke = colors.stroke;
                }
            } else {
                if (eles[0].attributes['fill']) {
                    clrfill = eles[0].attributes['fill'].value;
                    this.colorFill = clrfill;
                }
                if (eles[0].attributes['stroke']) {
                    clrstroke = eles[0].attributes['stroke'].value;
                    this.colorStroke = clrstroke;
                }
                // this.setFillColor(this.colorFill);
                // console.log('f:' + this.colorFill + ' s:' + this.colorStroke);
            }
        }
    }

    /**
     * return the fill color of svg element 'g'
     * @param eleId
     */
    private getFillColor(eleId) {
        if (eleId) {
            let ele = document.getElementById(eleId);
            if (ele) {
                return ele.getAttribute('fill');
            }
        }
    }

    /**
     * load the view to svg-editor and canvas
     * @param view view to load
     */
    private loadView(view: View) {
        if (view) {
            this.clearEditor();
            if (this.editorMode !== EditorModeType.CARDS) {
                let svgcontent: string = '';
                let v = this.getView(view.name)
                if (v) {
                    svgcontent = v.svgcontent;
                }
                if (svgcontent.length <= 0) {
                    svgcontent = '<svg id="' + view.name + '" width="' + view.profile.width + '" height="' + view.profile.height +
                        '" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">' +
                        '<filter id="blur-filter" x="-3" y="-3" width="200" height="200"><feGaussianBlur in="SourceGraphic" stdDeviation="3" /></filter>' +
                        '<g><title>Layer 1</title></g></svg>';
                }
                if (this.winRef.nativeWindow.svgEditor) {
                    this.winRef.nativeWindow.svgEditor.setDocProperty(view.name, view.profile.width, view.profile.height, view.profile.bkcolor);
                    this.winRef.nativeWindow.svgEditor.setSvgString(svgcontent);
                }

                // check gauge to init
                this.gaugesRef = [];
                setTimeout(() => {
                    for (let key in v.items) {
                        let ga: GaugeSettings = this.getGaugeSettings(v.items[key]);
                        this.checkGaugeAdded(ga);
                    }
                    this.winRef.nativeWindow.svgEditor.refreshCanvas();
                }, 500);
            } else if (this.cardsview) {
                this.cardsview.view = view;
                this.cardsview.reload();
            }
        }
    }

    /**
     * get view from hmi views list
     * @param name view name
     */
    private getView(name) {
        for (var i = 0; i < this.hmi.views.length; i++) {
            if (this.hmi.views[i].name === name) {
                return this.hmi.views[i];
            }
        }
        return null;
    }

    getViewsSorted() {
        return this.hmi.views.sort((a, b) => {
            if (a.name > b.name) { return 1; }
            return -1;
        });
    }
    //#endregion

    //#region Cards Widget
    editCardsWidget(item: any) {
        let exist: string[] = this.cardsview.getWindgetViewName();
        if (item.card.data && exist.indexOf(item.card.data) >= 0) {
            exist = exist.filter((n) => n !== item.card.data);
        }
        let cardType = Utils.getEnumKey(ViewType, ViewType.cards);
        let views = this.hmi.views.filter((v) => v.type !== cardType && exist.indexOf(v.name) < 0).map((v) => { return v.name })
        let dialogRef = this.dialog.open(CardConfigComponent, {
            position: { top: '60px' },
            data: { item: item, views: views }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let view = this.hmi.views.filter((v) => v.name === item.card.data);
                if (view && view.length) {
                    item.content = view[0];
                } else {
                    item.content = null;
                }
                this.onSaveProject();
                this.cardsview.render();
            }
        });
    }

    addCard() {
        this.cardsview.addCardsWidget();
    }

    saveCards(dashboard) {
        // this.dashboard.splice(this.dashboard.indexOf(item), 1);
    }
    // #region 

    //#region Svg-editor event and function interface
    /**
     * set the mode to svg-editor (line,text,...)
     * @param mode mode to set
     */
    setMode(mode: string) {
        this.currentMode = mode;
        this.clearSelection();
        this.checkFillAndStrokeColor();
        this.winRef.nativeWindow.svgEditor.clickToSetMode(mode);
    }

    /**
     * check with the current mode
     * @param mode mode to check
     */
    isModeActive(mode) {
        return (this.currentMode === mode)
    }

    /**
     * clear svg-editor and the canvas
     */
    private clearEditor() {
        if (this.winRef.nativeWindow.svgEditor) {
            this.winRef.nativeWindow.svgEditor.clickClearAll();
        }
    }

    /** 
     * check if fill and stroke not the same color is, text and label set all to black
     */
    private checkFillAndStrokeColor() {
        if (this.colorFill && this.colorStroke && this.colorFill === this.colorStroke) {
            this.setFillColor(this.colorDefault.fill);
            this.setStrokeColor(this.colorDefault.stroke);
        }
    }

    /**
     * event from svg-editor by new selection svg element
     * @param event svg element
     */
    private onSelectedElement(elems) {
        this.selectedElement = null;
        try {
            // to remove some strange effects
            if (document.activeElement !== document.body) (document.activeElement as HTMLElement).blur();
        } catch (e) { }
        if (elems) {
            for (let i = 0; i < elems.length; i++) {
                // console.log('selected: ' + event[i].id + ' ' + event[i].type);
            }
            if (elems.length <= 1) {
                this.selectedElement = elems[0];
                this.selectedElement.type = elems[0].type || 'svg-ext-shapes-' + (this.currentMode || 'default');
                this.checkColors(this.selectedElement);
                this.checkGaugeInView(this.selectedElement);
            }
        }
    }

    /**
     * event from svg-editor: for every loaded extension
     * @param args
     */
    private onExtensionLoaded(args) {
        if (args && args.length) {
            // console.log('ext \'' + args[0] + '\' loaded');
        }
    }

    /**
     * event from svg-editor: change fill color
     * @param event color code
     */
    onChangeFillColor(event) {
        this.setFillColor(event);
        this.checkMySelectedToSetColor(this.colorFill, null, this.winRef.nativeWindow.svgEditor.getSelectedElements());
    }

    /**
     * event change stroke color (from bottom color panel)
     * @param event color code
     */
    onChangeStrokeColor(event) {
        this.setStrokeColor(event);
        this.checkMySelectedToSetColor(null, this.colorStroke, this.winRef.nativeWindow.svgEditor.getSelectedElements());
    }


    /**
     * event from svg-editor: svg element removed
     * @param ele svg element
     */
    private onRemoveElement(ele: any) {
        if (this.currentView && this.currentView.items && ele) {
            for (let i = 0; i < ele.length; i++) {
                if (this.currentView.items[ele[i].id]) {
                    delete this.currentView.items[ele[i].id];
                }
            }
        }
    }

    /**
     * set the fill color (to svg-editor)
     * @param event color code
     */
    private setFillColor(event) {
        let color = event;
        if (color.charAt(0) === '#')
            color = color.slice(1);
        let alfa = 100;
        if (this.winRef.nativeWindow.svgEditor) {
            this.winRef.nativeWindow.svgEditor.setColor(color, alfa, "fill");
        }
        // this.fillcolor;
    }

    /**
     * set stroke color (to svg-editor)
     * @param event color code
     */
    setStrokeColor(event) {
        let color = event;
        if (color.charAt(0) === '#')
            color = color.slice(1);
        let alfa = 100;
        this.winRef.nativeWindow.svgEditor.setColor(color, alfa, "stroke");
        // this.fillcolor;
    }

    /**
     * set the marker to selected element (->, <->, <-)
     * @param id marker id (start,mid,end)
     * @param marker marker type
     */
    onSetMarker(id, marker) {
        if (marker >= 0) {
            this.winRef.nativeWindow.svgEditor.setMarker(id, marker);
        }
    }

    /**
     * align the selected element
     * @param letter align type (left,center,right,top,middle,bottom)
     */
    onAlignSelected(letter: string) {
        this.winRef.nativeWindow.svgEditor.alignSelectedElements(letter.charAt(0));
    }

    /**
     * select the zoom area function
     */
    onZoomSelect() {
        this.winRef.nativeWindow.svgEditor.clickZoom();
    }

    /**
     * show grid in canvas
     */
    onShowGrid() {
        this.gridOn = this.gridOn = !this.gridOn;
        this.winRef.nativeWindow.svgEditor.clickExtension("view_grid");
        this.winRef.nativeWindow.svgEditor.enableGridSnapping(this.gridOn);
    }

    /**
     * add image to view
     * @param event selected file
     */
    onSetImage(event) {
        if (event.target.files) {
            this.imagefile = 'assets/images/' + event.target.files[0].name;
            let self = this;
            if (this.imagefile.split('.').pop().toLowerCase() === 'svg') {
                let reader = new FileReader();
                reader.onloadend = function (e: any) {
                    self.winRef.nativeWindow.svgEditor.setSvgImageToAdd(e.target.result);
                    self.setMode('svg-image');
                };
                reader.readAsText(event.target.files[0]);
            } else {
                this.getBase64Image(event.target.files[0], function (imgdata) {
                    let data = imgdata;
                    self.winRef.nativeWindow.svgEditor.promptImgURLcallback = data;
                    self.setMode('image');
                });
            }
        }
    }

    /**
     * convert image file to code to attach in svg
     * @param file image file
     * @param callback event for end load image
     */
    private getBase64Image(file, callback) {
        var fr = new FileReader();
        fr.onload = function () {
            callback(fr.result);
        }
        fr.readAsDataURL(file);
    }

    /**
     * set stroke to svg selected (joinmieter, joinround, joinbevel, capbutt, capsquare, capround)
     * @param option stroke type
     */
    onSetStrokeOption(option) {
        this.winRef.nativeWindow.svgEditor.setStrokeOption(option);
    }

    /**
     * set shadow to svg selected
     * @param event shadow
     */
    onSetShadowOption(event) {
        this.winRef.nativeWindow.svgEditor.onSetShadowOption(event);
    }

    /**
     * set font to svg selected
     * @param font font family
     */
    onFontFamilyChange(font) {
        this.winRef.nativeWindow.svgEditor.setFontFamily(font);
    }

    /**
     * align the svg text (left,middle,right)
     * @param align type
     */
    onTextAlignChange(align) {
        this.winRef.nativeWindow.svgEditor.setTextAlign(align);
    }

    checkMySelectedToSetColor(bkcolor, color, elems) {
        GaugesManager.initElementColor(bkcolor, color, elems);
    }

    /**
     * check and set the special gauge like ngx-uplot, ngx-gauge, ... if added
     * if return true then the GaugeSettings is changed have to set again
     * @param ga
     */
    checkGaugeAdded(ga: GaugeSettings) {
        let gauge = this.gaugesManager.initElementAdded(ga, this.resolver, this.viewContainerRef, false);
        if (gauge) {
            if (gauge !== true) {
                if (this.gaugesRef.indexOf(ga.id) === -1) {
                    this.gaugesRef[ga.id] = { type: ga.type, ref: gauge };
                }
            }
            this.setGaugeSettings(ga);
        }
    }

    /**
     * dialog to define hyperlink
     */
    onMakeHyperlink() {
        let dialogRef = this.dialog.open(DialogLinkProperty, {
            data: { url: 'https://' },
            position: { top: '60px' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.url) {
                this.winRef.nativeWindow.svgEditor.makeHyperlink(result.url);
            }
        });
    }
    //#endregion

    //#region Toolbar Top Events
    /**
     * save current project and launch the Test in new Windows 'lab'
     */
    onStartCurrent() {
        this.onSaveProject();
        this.winRef.nativeWindow.open('lab', 'MyTest', 'width=800,height=640,menubar=0');
    }
    //#endregion

    //#region Project Events
    /**
     * Save Project
     * Save the current View
     */
    onSaveProject() {
        if (this.currentView) {
            this.currentView.svgcontent = this.getContent();
            this.saveView(this.currentView);
        }
    }

    //#endregion

    //#region View Events (Add/Rename/Delete/...)
    onAddDoc() {
        let exist = this.hmi.views.map((v) => { return v.name });
        let dialogRef = this.dialog.open(DialogNewDoc, {
            position: { top: '60px' },
            data: { name: '', type: Utils.getEnumKey(ViewType, ViewType.svg), exist: exist }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.name && result.type) {
                this.addView(result.name, result.type);
            }
        });
    }

    /**
     * Add View to Project with a default name View_[x]
     */
    addView(name?: string, type?: ViewType) {
        if (this.hmi.views) {
            let nn = "View_";
            let idx = 1;
            for (idx = 1; idx < this.hmi.views.length + 2; idx++) {
                let found = false;
                for (var i = 0; i < this.hmi.views.length; i++) {
                    if (this.hmi.views[i].name === nn + idx) {
                        found = true;
                        break;
                    }
                }
                if (!found)
                    break;
            }
            let v = new View();
            v.type = type;
            if (name) {
                v.name = name;
            } else if (this.hmi.views.length <= 0) {
                v.name = 'MainView';
            } else {
                v.name = nn + idx;
                v.profile.bkcolor = '#ffffffff';
            }
            if (type === Utils.getEnumKey(ViewType, ViewType.cards)) {
                v.profile.bkcolor = 'rgba(67, 67, 67, 1)';
            }
            v.id = 'v_' + Utils.getShortGUID();
            this.hmi.views.push(v);
            this.onSelectView(v);
            this.saveView(this.currentView);
        }
    }

    /**
     * Clone the View, copy and change all ids
     * @param view
     */
    onCloneView(view: View) {
        if (view) {
            let nn = "View_";
            let idx = 1;
            for (idx = 1; idx < this.hmi.views.length + 2; idx++) {
                let found = false;
                for (var i = 0; i < this.hmi.views.length; i++) {
                    if (this.hmi.views[i].name === nn + idx) {
                        found = true;
                        break;
                    }
                }
                if (!found)
                    break;
            }
            let torename = { content: JSON.stringify(view), id: '' };
            // change all gauge ids
            let idrenamed = [];
            for (let key in view.items) {
                torename.id = key;
                let newid = this.winRef.nativeWindow.svgEditor.renameSvgExtensionId(torename);
                idrenamed.push(newid);
            }
            let strv = this.winRef.nativeWindow.svgEditor.renameAllSvgExtensionId(torename.content, idrenamed);
            let v: View = JSON.parse(strv);
            v.id = 'v_' + Utils.getShortGUID();
            v.name = nn + idx;
            this.hmi.views.push(v);
            this.onSelectView(v);
            this.saveView(this.currentView);
        }
    }

    /**
     * Delete the View from hmi.views list
     * @param view View to delete
     */
    onDeleteView(view) {
        let msg = '';
        this.translateService.get('msg.view-remove', { value: view.name }).subscribe((txt: string) => { msg = txt });
        let dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: { msg: msg },
            position: { top: '60px' }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && this.hmi.views) {
                let toselect = null;
                for (var i = 0; i < this.hmi.views.length; i++) {
                    if (this.hmi.views[i].id === view.id) {
                        this.hmi.views.splice(i, 1);
                        if (i > 0 && i < this.hmi.views.length) {
                            toselect = this.hmi.views[i];
                        }
                        break;
                    }
                }
                this.currentView = null;
                if (toselect) {
                    this.onSelectView(toselect);
                } else if (this.hmi.views.length > 0) {
                    this.onSelectView(this.hmi.views[0]);
                }
                this.removeView(view);
            }
        });
    }

    /**
     * Rename the View (only name)
     * @param view View to rename
     */
    onRenameView(view) {
        let exist = this.hmi.views.filter((v) => v.id !== view.id).map((v) => { return v.name });
        let dialogRef = this.dialog.open(DialogDocName, {
            position: { top: '60px' },
            data: { name: view.name, exist: exist }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.name) {
                view.name = result.name;
                this.saveView(view);
            }
        });
    }

    /**
     * Edit View property
     * @param view View to change property (height, width, background)
     */
    onPropertyView(view) {
        let dialogRef = this.dialog.open(DialogDocProperty, {
            position: { top: '60px' },
            data: { name: view.name, type: view.type, profile: view.profile }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result && result.profile) {
                if (result.profile.height) view.profile.height = parseInt(result.profile.height);
                if (result.profile.width) view.profile.width = parseInt(result.profile.width);
                if (result.profile.margin >= 0) view.profile.margin = parseInt(result.profile.margin);
                view.profile.bkcolor = result.profile.bkcolor;
                this.winRef.nativeWindow.svgEditor.setDocProperty(view.name, view.profile.width, view.profile.height, view.profile.bkcolor);
                this.onSelectView(view);
            }
        });
    }

    /**
     * select the view, save current vieww before
     * @param view selected view to load resource
     */
    private onSelectView(view) {
        if (this.currentView) {
            this.currentView.svgcontent = this.getContent();
            // this.hmi.views[this.currentView].svgcontent = this.winRef.nativeWindow.svgEditor.getSvgString();
        } else {
            this.setFillColor(this.colorFill);
        }
        if (this.currentView) {
            this.saveView(this.currentView);
        }
        this.currentView = view;
        if (this.currentView.type === Utils.getEnumKey(ViewType, ViewType.cards)) {
            this.editorMode = EditorModeType.CARDS;
        } else {
            this.editorMode = EditorModeType.SVG;
        }
        localStorage.setItem("@frango.webeditor.currentview", this.currentView.name);
        this.loadView(this.currentView);
    }

    /**
     * check with the current view
     * @param view view to check
     */
    isViewActive(view) {
        return (this.currentView && this.currentView.name === view.name);
    }

    /**
     * Export view in a file json format MyView.fuxav
     * @param view
     */
    onExportView(view: View) {
        let filename = 'fuxa-view.json';
        let date = new Date();
        let content = JSON.stringify(view);
        let blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        FileSaver.saveAs(blob, filename);
    }

    /**
     * 导出 svg 文件
     * @param view 
     */
    onExportJsonScadaView(view: View) {
        let filename = 'fuxa-view.svg';
        let blob = new Blob([generateJsonScadaSvg(view)], { type: 'image/svg+xml;charset=utf-8' });
        FileSaver.saveAs(blob, filename);
    }

    /**
     * Import view from file (exported in json format MyView.fuxav)
     */
    onImportView() {
        let ele = document.getElementById('viewFileUpload') as HTMLElement;
        ele.click();
    }

    /**
 * open Project event file loaded
 * @param event file resource
 */
    onViewFileChangeListener(event) {
        let text = [];
        let files = event.srcElement.files;
        let input = event.target;
        let reader = new FileReader();
        reader.onload = (data) => {
            let view = JSON.parse(reader.result.toString());
            if (view) {
                let idx = 1;
                let startname = view.name;
                let existView = null;
                while (existView = this.hmi.views.find((v) => v.name === view.name)) {
                    view.name = startname + '_' + idx++;
                }
                view.id = 'v_' + Utils.getShortGUID();
                this.hmi.views.push(view);
                this.onSelectView(view);
                this.saveView(this.currentView);
            }
            // this.projectService.setProject(prj, true);
        }

        reader.onerror = function () {
            let msg = 'Unable to read ' + input.files[0];
            // this.translateService.get('msg.project-load-error', {value: input.files[0]}).subscribe((txt: string) => { msg = txt });
            alert(msg);
        };
        reader.readAsText(input.files[0]);
        this.viewFileImportInput.nativeElement.value = null;
    }
    //#endregion

    //#region Panels State
    /**
     * Load the left panels state copied in localstorage
     */
    private loadPanelState() {
        let ps = localStorage.getItem("@frango.webeditor.panelsState");
        this.panelsState.enabled = true;
        if (ps) {
            this.panelsState = JSON.parse(ps);
        }
    }

    /**
     * Save the panels state in localstorage (after every toggled)
     */
    savePanelState() {
        if (this.panelsState.enabled) {
            localStorage.setItem("@frango.webeditor.panelsState", JSON.stringify(this.panelsState));
        }
    }
    //#endregion

    //#region Interactivity
    /**
     * to check from DOM and to control open close interaction panel
     * @param ele selected gauge element
     */
    isInteractivtyEnabled(ele) {
        if (ele && ele.type) {
            return this.gaugesManager.isGauge(ele.type);
        }
        return false;
    }

    /**
     * callback to open edit gauge property form (from GaugeBase)
     * @param event
     */
    onGaugeEdit(event) {
        let settings = this.gaugePanelComponent.settings;
        this.openEditGauge(settings, data => {
            this.setGaugeSettings(data);
        });
    }

    /**
     * callback to open edit gauge property form (from selected element context menu)
     */
    onGaugeEditEx() {
        setTimeout(() => {
            this.gaugePanelComponent.onEdit();
        }, 500)
    }

    isWithEvents(type) {
        return this.gaugesManager.isWithEvents(type);
    }

    isWithActions(type) {
        return this.gaugesManager.isWithActions(type);
    }

    /**
     * edit the gauges/chart settings property, the settings are composed from gauge id... and property
     * in property will be the result values saved
     *
     * @param settings
     * @param callback
     */
    openEditGauge(settings, callback) {
        let tempsettings = JSON.parse(JSON.stringify(settings));
        let hmi = this.projectService.getHmi();
        let dlgType = GaugesManager.getEditDialogTypeToUse(settings.type);
        let eventsSupported = this.isWithEvents(settings.type);
        let actionsSupported = this.isWithActions(settings.type);
        let defaultValue = GaugesManager.getDefaultValue(settings.type);
        let names = Object.values(this.currentView.items).map(gs => gs.name);
        // set default name
        if (!tempsettings.name) {
            tempsettings.name = Utils.getNextName(GaugesManager.getPrefixGaugeName(settings.type), names);
        }
        // settings.property = JSON.parse(settings.property);
        let dialogRef: any;
        if (dlgType === GaugeDialogType.Chart) {
            dialogRef = this.dialog.open(ChartPropertyComponent, {
                position: { top: '60px' },
                data: {
                    settings: tempsettings, devices: Object.values(this.projectService.getDevices()),
                    views: hmi.views, dlgType: dlgType, charts: this.projectService.getCharts(),
                    names: names
                }
            });
        } else if (dlgType === GaugeDialogType.Gauge) {
            dialogRef = this.dialog.open(BagPropertyComponent, {
                position: { top: '30px' },
                data: {
                    settings: tempsettings, devices: Object.values(this.projectService.getDevices()), dlgType: dlgType,
                    names: names
                }
            });
        } else if (dlgType === GaugeDialogType.Pipe) {
            dialogRef = this.dialog.open(PipePropertyComponent, {
                position: { top: '60px' },
                data: {
                    settings: tempsettings, devices: Object.values(this.projectService.getDevices()),
                    withEvents: eventsSupported, withActions: actionsSupported,
                    names: names
                }
            });
        } else if (dlgType === GaugeDialogType.Slider) {
            dialogRef = this.dialog.open(SliderPropertyComponent, {
                position: { top: '60px' },
                data: {
                    settings: tempsettings, devices: Object.values(this.projectService.getDevices()),
                    withEvents: eventsSupported, withActions: actionsSupported,
                    names: names
                }
            });
        } else if (dlgType === GaugeDialogType.Switch) {
            dialogRef = this.dialog.open(HtmlSwitchPropertyComponent, {
                position: { top: '60px' },
                data: {
                    settings: tempsettings, devices: Object.values(this.projectService.getDevices()),
                    withEvents: eventsSupported, withActions: actionsSupported,
                    names: names
                }
            });
        } else {
            let title = this.getGaugeTitle(settings.type);
            dialogRef = this.dialog.open(GaugePropertyComponent, {
                position: { top: '60px' },
                data: {
                    settings: tempsettings, devices: Object.values(this.projectService.getDevices()), title: title,
                    views: hmi.views, dlgType: dlgType, withEvents: eventsSupported, withActions: actionsSupported, default: defaultValue,
                    inputs: Object.values(this.currentView.items).filter(gs => gs.name && (gs.id.startsWith('HXS_') || gs.id.startsWith('HXI_'))),
                    names: names,
                    // view 将被用于 json-scada 导出的上下文对象
                    currentView: this.currentView,
                    hmi: this.hmi,
                }
            });
        }
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                callback(result.settings);
                this.saveView(this.currentView);
                let result_gauge = this.gaugesManager.initInEditor(result.settings, this.resolver, this.viewContainerRef);
                if (dlgType === GaugeDialogType.Pipe && result_gauge && result_gauge.element && result_gauge.element.id !== result.settings.id) {
                    // by init a path we need to change the id
                    delete this.currentView.items[result.settings.id];
                    result.settings.id = result_gauge.element.id;
                    callback(result.settings);
                    this.saveView(this.currentView);
                }
            }
        });
    }

    private getGaugeTitle(type) {
        let msg = '';
        if (type.startsWith(HtmlInputComponent.TypeTag)) {
            this.translateService.get('editor.controls-input-settings').subscribe((txt: string) => { msg = txt });
        } else if (type.startsWith(ValueComponent.TypeTag)) {
            this.translateService.get('editor.controls-output-settings').subscribe((txt: string) => { msg = txt });
        } else if (type.startsWith(HtmlButtonComponent.TypeTag)) {
            this.translateService.get('editor.controls-button-settings').subscribe((txt: string) => { msg = txt });
        } else if (type.startsWith(HtmlSelectComponent.TypeTag)) {
            this.translateService.get('editor.controls-select-settings').subscribe((txt: string) => { msg = txt });
        } else if (type.startsWith(GaugeProgressComponent.TypeTag)) {
            this.translateService.get('editor.controls-progress-settings').subscribe((txt: string) => { msg = txt });
        } else if (type.startsWith(GaugeSemaphoreComponent.TypeTag)) {
            this.translateService.get('editor.controls-semaphore-settings').subscribe((txt: string) => { msg = txt });
        } else {
            this.translateService.get('editor.controls-shape-settings').subscribe((txt: string) => { msg = txt });
        }
        return msg;
    }

    //#endregion

    isWithShadow() {
        if (this.selectedElement) {

        }
        return false;
    }

    private fileNew() {
    }

    private checkValid(hmi) {
        if (!hmi.views) {
            hmi.views = [];
            return false;
        }
        return true;
    }

    private clearSelection() {
        this.winRef.nativeWindow.svgEditor.clearSelection();
    }

    cloneElement() {
        this.winRef.nativeWindow.svgEditor.clickExtension("view_grid");
    }

    flipSelected(fliptype: string) {
    }
}

@Component({
    selector: 'dialog-new-doc',
    templateUrl: 'newdoc.dialog.html',
})
export class DialogNewDoc {
    docType = ViewType;
    constructor(
        public dialogRef: MatDialogRef<DialogNewDoc>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

    isValid(name): boolean {
        if (!this.data.type) return false;
        if (!this.data.name) return false;
        return (this.data.exist.find((n) => n === name)) ? false : true;
    }
}

@Component({
    selector: 'dialog-doc-property',
    templateUrl: 'docproperty.dialog.html',
    styleUrls: ['docproperty.dialog.css']
})
export class DialogDocProperty {
    defaultColor = Utils.defaultColor;
    cardViewType = Utils.getEnumKey(ViewType, ViewType.cards);

    propSizeType = [{ text: 'dlg.docproperty-size-320-240', value: { width: 320, height: 240 } }, { text: 'dlg.docproperty-size-460-360', value: { width: 460, height: 360 } },
    { text: 'dlg.docproperty-size-640-480', value: { width: 640, height: 480 } }, { text: 'dlg.docproperty-size-800-600', value: { width: 800, height: 600 } },
    { text: 'dlg.docproperty-size-1024-768', value: { width: 1024, height: 768 } }, { text: 'dlg.docproperty-size-1280-960', value: { width: 1280, height: 960 } },
    { text: 'dlg.docproperty-size-1600-1200', value: { width: 1600, height: 1200 } }, { text: 'dlg.docproperty-size-1920-1080', value: { width: 1920, height: 1080 } }];
    constructor(private translateService: TranslateService,
        public dialogRef: MatDialogRef<DialogDocProperty>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        for (let i = 0; i < this.propSizeType.length; i++) {
            this.translateService.get(this.propSizeType[i].text).subscribe((txt: string) => { this.propSizeType[i].text = txt });
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onSizeChange(size) {
        if (size && size.width && size.height) {
            this.data.profile.width = size.width;
            this.data.profile.height = size.height;
        }
    }
}

@Component({
    selector: 'dialog-doc-name',
    templateUrl: 'docname.dialog.html',
})
export class DialogDocName {
    constructor(
        public dialogRef: MatDialogRef<DialogDocName>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }

    isValid(name): boolean {
        return (this.data.exist.find((n) => n === name)) ? false : true;
    }
}

@Component({
    selector: 'dialog-link-property',
    templateUrl: 'linkproperty.dialog.html',
})
export class DialogLinkProperty {
    constructor(
        public dialogRef: MatDialogRef<DialogLinkProperty>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

export enum EditorModeType {
    SVG,
    CARDS
}
