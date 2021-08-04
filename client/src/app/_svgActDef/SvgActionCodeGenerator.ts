/**
 * 这是一个代码生成器的抽象超类, 提供了可复用的基本方法
 * 用来根据不同的 svg shape 类型, 以及提供的 tag stateRanges eleId extCode 生成 json-scada 
 * 中的动画脚本, 以及由 extCode 提供的自定义的扩展功能
 * 在代码环境中, 包含这样一个 api, 这个 api 由 generateJsonScadaCallbackCode 方法生成
 * interface api {
 *   tagName: string; // json-scada tag 的名称
 *   tagData: number; // json-scada tag 的实时值
 *   elementId: string; // 对应 svg 视图对象在环境中的 id
 * }
 */
export abstract class SvgActionCodeGenerator {
    public actions = [];

    private static objectMap: Map<string, SvgActionCodeGenerator> = new Map([
    ]);

    /**
     * 这是代码生成器的主要方法, 其子类负责实现 stateRangesMapProcessor 并调用该方法
     * @param tag json-scada 的 tag
     * svgTypeTag 一般为 svg-ext-{typeId}-{name}
     * svg-ext 前缀位于 src/app/gauges/shapes/ 下对应组件中的 TypeTag 属性, 在该属性处拼接
     * {typeId} 来自 src/assets/lib/svgeditor/shapes/ 下你的 svg 定义文件(.js) 中的 typeId
     * {name} 同样来自该文件，是每个不同 shape 定义的 name 属性值
     * @param stateRanges 数据范围, 以及对应生效的状态
     * @param eleId 对应 svg 视图对象在环境中的 id
     * @param extCode 开放能力, 任意代码, 该属性的值将被添加在生成的代码后
     * @param stateRangesMapProcessor 用来根据 stateRange 生成脚本代码
     */
    public generateCode({ tag, stateRanges, eleId, extCode, stateRangesMapProcessor }: GenerateCodeOptions) {
        return generateJsonScadaCallbackCode({
            eleId,
            tag,
            code: `
                ${stateRanges && stateRanges
                    // 根据 stateRanges 生成脚本代码
                    .map(stateRangesMapProcessor)
                    .join('')
                    // 可能存在的扩展脚本代码
                    .concat(typeof extCode == 'string' ? extCode : '')
                }
            `
        });
    }

    /**
     * @factory
     * 用来根据 shape 的 typeTag 获取实例
     */
    public static getInstance(shapeTypeTag: string): SvgActionCodeGenerator {
        return this.objectMap.get(shapeTypeTag);
    }
}

export interface GenerateCodeOptions {
    tag: string;
    stateRanges: StateRange[];
    eleId: string;
    extCode?: string;
    stateRangesMapProcessor?: (stateRange: StateRange) => string;
}

// 生成脚本代码的依据
export interface StateRange {
    state: string;
    min: number;
    max: number;
};

/**
 * 生成一个 json-scada 环境的代码
 * @param tag json-scada tag
 * @param code 自定义代码
 */
function generateJsonScadaCallbackCode(options: { tag: string, code: string, eleId: string }): string {
    return `
    var api = {
        tagName: '${options.tag}',
        tagData: $V('${options.tag}'),
        elementId: '${options.eleId}'
    }
    ${options.code}
    `;
}
