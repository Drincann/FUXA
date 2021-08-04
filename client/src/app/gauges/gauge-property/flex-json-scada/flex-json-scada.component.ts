import { Component, Input, OnInit, Output } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import {
    GaugeEvent,
    GaugeEventActionType,
    GaugeEventType,
    GaugeProperty,
    GaugeSettings,
    inkscapeLabel,
    View
} from '../../../_models/hmi';
import { StateRange, SvgActionCodeGenerator } from '../../../_svgActDef/SvgActionCodeGenerator';
import { SvgActionCodeGeneratorFactory } from '../../../_svgActDef/SvgActionCodeGeneratorFactory';
@Component({
    selector: 'flex-json-scada',
    templateUrl: './flex-json-scada.component.html',
    styleUrls: ['./flex-json-scada.component.css']
})
export class FlexJsonScadaComponent implements OnInit {
    @Input() data: {
        currentView: View, views: View[], settings: {
            id?: string;
            label?: string;
            name?: string;
            type?: string;
            property?: Record<string, any>
        }
    };
    private extCode: string;
    private tag: string;
    private stateRanges: StateRange[];
    private test = [1, 2, 3, 4];
    private svgActionCodeGenerator: SvgActionCodeGenerator = null;
    constructor(public translateService: TranslateService) { }

    ngOnInit() {
        try {
            this.extCode = this._unescape(
                this.data.currentView.jsonScadaSettings
                && this.data.currentView.jsonScadaSettings[this.data.settings.id]
                && this.data.currentView.jsonScadaSettings[this.data.settings.id].extCode);

            this.tag =
                this.data.currentView.jsonScadaSettings
                && this.data.currentView.jsonScadaSettings[this.data.settings.id]
                && this.data.currentView.jsonScadaSettings[this.data.settings.id].tag;

            this.stateRanges =
                this.data.currentView.jsonScadaSettings
                && this.data.currentView.jsonScadaSettings[this.data.settings.id]
                && this.data.currentView.jsonScadaSettings[this.data.settings.id].stateRanges
                || [];

            this.svgActionCodeGenerator = SvgActionCodeGeneratorFactory.getInstance(this.data.settings.type);
        } catch (error) { }
    }

    /**
     * 获取设置的属性值 map
     */
    public getSvgEleAttribute() {
        let attrs = {};

        if (this.svgActionCodeGenerator != null) {
            attrs['inkscape:label'] = {
                'attr': 'script',
                'list': [
                    {
                        'evt': 'exec_on_update',
                        'param': this.svgActionCodeGenerator.generateCode({
                            tag: this.tag,
                            stateRanges: this.stateRanges,
                            eleId: this.data.settings.id,
                            extCode: this.extCode,
                        }),
                    }
                ]
            }
        }

        return attrs;
    }

    /**
     * 仅用作 gauge-property.component 调用保存至上下文变量 View 所用
     * 不会参与 svg attr 的获取
     */
    public getSvgSettings() {
        if (this.tag == null && this.stateRanges == null) {
            return undefined;
        }
        return {
            tag: this.tag,
            stateRanges: this.stateRanges,
            extCode: this.extCode,
        }
    }

    /**
     * 替换可能存在的 html 中被转义的字符
     * 原则上讲一般不需要替换, 应该尽可能避免存在需要转义的字符、
     * 如果未来需要在某处解析 svg 结构提取 json-scada 属性到 View 上下文对象中, 则需要在解析时做好 unescape
     * @param str 
     * @returns 
     */
    private _unescape(str: string) {
        if (str == null) {
            return str;
        }

        if (typeof str !== "string") {
            str = String(str);
        }

        if (/[&<>\"\']/.test(String(str))) {
            return str
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&apos;/g, '\'')
                .replace(/&quot;/g, '"');
        } else {
            return str;
        }
    }

    addRangeStateView() {
        this.stateRanges.push({
            state: this.svgActionCodeGenerator.actions[0],
            min: 0,
            max: 0,
        });
    }

    removeRangeStateView(index: number) {
        this.stateRanges.splice(index, 1);
    }
}
