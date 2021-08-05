import { SvgActionCodeGenerator } from './SvgActionCodeGenerator';
import { Truck } from './Truck';

export class SvgActionCodeGeneratorFactory {
    private static objectMap: Map<string, SvgActionCodeGenerator> = new Map([
        /**
         * key 为 svgTypeTag, 一般格式为 svg-ext-{typeId}-{name}
         * svg-ext 前缀位于 src/app/gauges/shapes/ 下对应组件中的 TypeTag 属性, 在该属性处拼接
         * {typeId} 来自 src/assets/lib/svgeditor/shapes/ 下你的 svg 定义文件(.js) 中的 typeId
         * {name} 同样来自该文件，是每个不同 shape 定义的 name 属性值
         */
        ['svg-ext-sld-truck', new Truck],
    ]);

    /**
     * @factory
     * 用来根据 shape 的 typeTag 获取实例
     */
    public static getInstance(shapeTypeTag: string): SvgActionCodeGenerator {
        return this.objectMap.get(shapeTypeTag);
    }
}