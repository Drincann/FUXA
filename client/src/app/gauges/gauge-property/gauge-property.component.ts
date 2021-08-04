import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';

import { SelOptionsComponent } from '../../gui-helpers/sel-options/sel-options.component';

import { FlexHeadComponent } from './flex-head/flex-head.component';
import { FlexEventComponent } from './flex-event/flex-event.component';
import { FlexActionComponent } from './flex-action/flex-action.component';
import { FlexJsonScadaComponent } from './flex-json-scada/flex-json-scada.component';
import { GaugeProperty, GaugeSettings, Hmi, View } from '../../_models/hmi';
import { UserGroups } from '../../_models/user';

@Component({
    selector: 'gauge-property',
    templateUrl: './gauge-property.component.html',
    styleUrls: ['./gauge-property.component.css']
})
export class GaugePropertyComponent implements OnInit {

    @Input() name: any;
    @ViewChild('flexhead') flexHead: FlexHeadComponent;
    @ViewChild('flexevent') flexEvent: FlexEventComponent;
    @ViewChild('flexaction') flexAction: FlexActionComponent;
    @ViewChild('flexjsonscada') flexJsonScada: FlexJsonScadaComponent;

    withAlarm = false;
    slideView = true;
    slideActionView = true;
    property: GaugeProperty;
    dialogType: GaugeDialogType = GaugeDialogType.RangeWithAlarm;
    eventsSupported: boolean;
    actionsSupported: any;
    views: View[];
    // 当前被设置的 svg 对象位于的视图
    currentView: View;
    defaultValue: any;
    inputs: GaugeSettings[];

    constructor(public dialog: MatDialog,
        public dialogRef: MatDialogRef<GaugePropertyComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    ngOnInit() {
        this.dialogType = this.data.dlgType;
        this.eventsSupported = this.data.withEvents;
        this.actionsSupported = this.data.withActions;
        this.views = this.data.views;
        this.inputs = this.data.inputs;
        this.currentView = this.data.currentView;

        this.property = JSON.parse(JSON.stringify(this.data.settings.property));
        if (!this.property) {
            this.property = new GaugeProperty();
        }

        // // check for button and to add the old binded signal to a event
        // if (this.data.settings.id.startsWith('HXB_') && this.property && this.property.variableId) {
        //     let eventwithsetvalue = this.property.events.find(ev => GaugeEventType[ev.type] === GaugeEventType.click &&
        //         GaugeEventActionType[ev.action] === GaugeEventActionType.onSetValue);
        //     if (eventwithsetvalue) {
        //         eventwithsetvalue.actoptions['variableSrc'] = this.property.variableSrc;
        //         eventwithsetvalue.actoptions['variableId'] = this.property.variableId;
        //         eventwithsetvalue.actoptions['variable'] = this.property.variable;
        //         this.property.variable = "";
        //         this.property.variableId = "";
        //         this.property.variableSrc = "";
        //     }
        // }

        this.defaultValue = this.data.default;

        if (this.dialogType === GaugeDialogType.OnlyValue) {
            this.flexHead.withInput = null;
        } else if (this.dialogType === GaugeDialogType.ValueAndUnit) {
            this.flexHead.withInput = 'unit';
        } else {
            this.flexHead.defaultValue = this.defaultValue;
            if (this.property && this.property.alarmSrc) {
                this.withAlarm = true;
            }
            this.flexHead.withInput = 'range';
            if (this.dialogType === GaugeDialogType.ValueWithRef) {
                this.flexHead.withInput = 'text';
                this.withAlarm = false;
            } else if (this.dialogType === GaugeDialogType.Step) {
                this.flexHead.withInput = 'step';
                this.withAlarm = false;
            } else if (this.dialogType === GaugeDialogType.MinMax) {
                this.flexHead.withInput = 'minmax';
                this.withAlarm = false;
            }
        }
    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        // this.data.settings.property = this.flexHead.property;
        this.data.settings.property = this.flexHead.getProperty();
        if (this.flexEvent) {
            this.data.settings.property.events = this.flexEvent.getEvents();
        }
        if (this.flexAction) {
            this.data.settings.property.actions = this.flexAction.getActions();
        }
        if (this.flexJsonScada) {
            // 借用 View 对象作为上下文对象，存储 json-scada svg 元素的属性值，并在 editor.component onExportJsonScadaView 作为导出 svg 视图并添加属性的依据
            for (let view of this.views) {
                // 找到对应的视图，修改对应视图上下文对象的对应值
                if (view.id == this.currentView.id) {
                    // null check
                    if (!view.jsonScadaId2Attr) {
                        view.jsonScadaId2Attr = {};
                    }
                    if (!view.jsonScadaId2Attr[this.data.settings.id]) {
                        view.jsonScadaId2Attr[this.data.settings.id] = {};
                    }

                    if (!view.jsonScadaSettings) {
                        view.jsonScadaSettings = {};
                    }
                    if (!view.jsonScadaSettings[this.data.settings.id]) {
                        view.jsonScadaSettings[this.data.settings.id] = {};
                    }

                    // 这里的调用在保存 View 为 svg 时会参与 svg attr set
                    view.jsonScadaId2Attr[this.data.settings.id] = this.flexJsonScada.getSvgEleAttribute();
                    // 这个调用仅用作保存设置状态, 即持久化设置
                    view.jsonScadaSettings[this.data.settings.id] = this.flexJsonScada.getSvgSettings();
                    break;
                }
            }
        }
        if (this.property.readonly) {
            this.property.readonly = true;
        } else {
            delete this.property.readonly;
        }
    }

    onAddInput() {
        this.flexHead.onAddInput();
    }

    onAddEvent() {
        this.flexEvent.onAddEvent();
    }

    onAddAction() {
        this.flexAction.onAddAction();
    }

    onRangeViewToggle() {
        this.flexHead.onRangeViewToggle(this.slideView);
    }

    onActionRangeViewToggle() {
        this.flexAction.onRangeViewToggle(this.slideActionView);
    }

    onAlarmToggle() {
        this.flexHead.onAlarmEnabled(this.withAlarm);
    }

    isToolboxToShow() {
        if (this.dialogType === GaugeDialogType.RangeWithAlarm || this.dialogType === GaugeDialogType.Range || this.dialogType === GaugeDialogType.Step) {
            return true;
        }
        return false;
    }

    isRangeToShow() {
        if (this.dialogType === GaugeDialogType.RangeWithAlarm || this.dialogType === GaugeDialogType.Range) {
            return true;
        }
        return false;
    }

    isAlarmToShow() {
        if (this.dialogType === GaugeDialogType.RangeWithAlarm) {
            return true;
        }
        return false;
    }

    isReadonlyToShow() {
        if (this.dialogType === GaugeDialogType.Step) {
            return true;
        }
        return false;
    }

    onEditPermission() {
        let permission = this.property.permission;
        let dialogRef = this.dialog.open(DialogGaugePermission, {
            position: { top: '60px' },
            data: { permission: permission }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.property.permission = result.permission;
            }
        });
    }
}

export enum GaugeDialogType {
    Range,
    RangeWithAlarm,
    OnlyValue,
    ValueAndUnit,
    ValueWithRef,
    Step,
    MinMax,
    Chart,
    Gauge,
    Pipe,
    Slider,
    Switch
}

@Component({
    selector: 'dialog-gaugepermission',
    templateUrl: './gauge-permission.dialog.html',
})
export class DialogGaugePermission {
    // defaultColor = Utils.defaultColor;
    selectedGroups = [];
    extensionGroups = [];
    groups = UserGroups.Groups;

    @ViewChild(SelOptionsComponent) seloptions: SelOptionsComponent;

    constructor(
        public dialogRef: MatDialogRef<DialogGaugePermission>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.selectedGroups = UserGroups.ValueToGroups(this.data.permission);
        this.extensionGroups = UserGroups.ValueToGroups(this.data.permission, true);

    }

    onNoClick(): void {
        this.dialogRef.close();
    }

    onOkClick(): void {
        this.data.permission = UserGroups.GroupsToValue(this.seloptions.selected);
        this.data.permission += UserGroups.GroupsToValue(this.seloptions.extSelected, true);
        this.dialogRef.close(this.data);
    }
}
