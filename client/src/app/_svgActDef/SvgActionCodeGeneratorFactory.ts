import { SvgActionCodeGenerator } from './SvgActionCodeGenerator';
import { Truck } from './Truck';

export class SvgActionCodeGeneratorFactory {
    private static objectMap: Map<string, SvgActionCodeGenerator> = new Map([
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