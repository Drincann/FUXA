import { SvgActionCodeGenerator, GenerateCodeOptions } from './SvgActionCodeGenerator';

export class Truck extends SvgActionCodeGenerator {
    public actions = ['in', 'out'];
    public generateCode({ tag, stateRanges, eleId, extCode }: GenerateCodeOptions) {
        return super.generateCode({
            tag, stateRanges, eleId, extCode, stateRangesMapProcessor: (stateRange) => {
                if (typeof stateRange == 'string') return stateRange;
                if (stateRange.state == 'in') {
                    return `
                    if(api.tagData >= ${stateRange.min} && api.tagData <= ${stateRange.max}){
                        $('#${eleId}').find("path[type='switcher']").show();
                    }
                    `;
                } else if (stateRange.state == 'out') {
                    return `
                    if(api.tagData >= ${stateRange.min} && api.tagData <= ${stateRange.max}){
                        $('#${eleId}').find("path[type='switcher']").hide();
                    }
                    `;
                }
            }
        });
    }
}