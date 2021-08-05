import { SvgActionCodeGenerator, GenerateCodeOptions } from './SvgActionCodeGenerator';

export class Disconnector extends SvgActionCodeGenerator {
    public actions = ['open', 'closed', 'bad', 'intermediate'];
    public generateCode({ tag, stateRanges, eleId, extCode }: GenerateCodeOptions) {
        return super.generateCode({
            tag, stateRanges, eleId, extCode, stateRangesMapProcessor: (stateRange) => {
                if (typeof stateRange == 'string') return stateRange;
                if (stateRange.state == 'open') {
                    return `
                    if(api.tagData >= ${stateRange.min} && api.tagData <= ${stateRange.max}){
                        $("#${eleId}").find(\`path[type="open"]\`).show();
                        $("#${eleId}").find(\`path[type="close"]\`).hide();
                        $("#${eleId}").find(\`path[type="intermediate"]\`).hide();
                    }
                    `;
                } else if (stateRange.state == 'closed') {
                    return `
                    if(api.tagData >= ${stateRange.min} && api.tagData <= ${stateRange.max}){
                        $("#${eleId}").find(\`path[type="open"]\`).hide();
                        $("#${eleId}").find(\`path[type="close"]\`).show();
                        $("#${eleId}").find(\`path[type="intermediate"]\`).hide();
                    }
                    `;
                } else if (stateRange.state == 'bad') {
                    return `
                    if(api.tagData >= ${stateRange.min} && api.tagData <= ${stateRange.max}){
                        $("#${eleId}").find(\`path[type="open"]\`).show();
                        $("#${eleId}").find(\`path[type="close"]\`).show();
                        $("#${eleId}").find(\`path[type="intermediate"]\`).hide();
                    }
                    `;
                } else if (stateRange.state == 'intermediate') {
                    return `
                    if(api.tagData >= ${stateRange.min} && api.tagData <= ${stateRange.max}){
                        $("#${eleId}").find(\`path[type="open"]\`).hide();
                        $("#${eleId}").find(\`path[type="close"]\`).hide();
                        $("#${eleId}").find(\`path[type="intermediate"]\`).show();
                    }
                    `;
                }
            }
        });
    }
}