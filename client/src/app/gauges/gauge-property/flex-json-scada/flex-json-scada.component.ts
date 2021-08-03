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

@Component({
    selector: 'flex-json-scada',
    templateUrl: './flex-json-scada.component.html',
    styleUrls: ['./flex-json-scada.component.css']
})
export class FlexJsonScadaComponent implements OnInit {
    @Input() data: { currentView: View, settings: { id: string, label: string, name: string }, views: View[] };
    private onUpdateScript: string;

    constructor(public translateService: TranslateService) {
    }

    ngOnInit() {
        try {
            this.onUpdateScript = this._unescape(this.data.currentView.jsonScadaId2Attr[this.data.settings.id]['inkscape:label'].list[0].param);
        } catch (error) { }
    }

    /**
     * 获取设置的属性值 map
     */
    public getSvgEleAttribute() {
        let attrs = {};
        if (this.onUpdateScript && this.onUpdateScript.trim() != '') {
            attrs['inkscape:label'] = {
                'attr': 'script',
                'list': [
                    {
                        'evt': 'exec_on_update',
                        'param': this.onUpdateScript,
                    }
                ]
            }
        }

        return attrs;
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

}
