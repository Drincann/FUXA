import { View } from "../_models/hmi";
declare var $: any;

export function generateJsonScadaSvg(view: View): string {
    let contentDocument = $(`<div>${view.svgcontent}</div>`);

    // 这里是 View 对象的 json-scada 表作用到视图上的唯一时机.
    // View.jsonScadaId2Attr 给出了足够的扩展空间, 这里作为抽象层不要改动,
    // 添加属性只需要在 hmi.ts 中添加对应模型, 并在 flex-json-scada.component 中提供 GUI 并在 getSvgEleAttribute 方法中导出数据即可
    for (let svgEleId in view.jsonScadaId2Attr) {
        for (let attrName in view.jsonScadaId2Attr[svgEleId]) {
            contentDocument.find(`#${svgEleId}`).attr(attrName,
                view.jsonScadaId2Attr[svgEleId][attrName]
                && view.jsonScadaId2Attr[svgEleId][attrName].map
                && view.jsonScadaId2Attr[svgEleId][attrName]
                    .map(value => JSON.stringify(value))
                    // 过滤掉空值
                    .filter(v => v != undefined)
                    .join(',')
                || ''
            );
            // 对 text 内部包一层 tspan 标签, 这是为了让 json-scada 中的 text 生效
            const textSvg = contentDocument.find(`#${svgEleId}`).filter((i, v) => v != undefined && v.localName == 'text');
            if (textSvg.length != 0) {
                textSvg.each((i, v) => $(v).html(`<tspan>${$(v).html()}</tspan>`))
            }
        }
    }
    return contentDocument.html();
}