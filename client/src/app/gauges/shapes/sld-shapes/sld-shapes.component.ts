/**
 * Shape extension
 */
import { Component } from '@angular/core';
import { GaugeBaseComponent } from '../../gauge-base/gauge-base.component'
import { GaugeSettings, GaugeAction, Variable, GaugeStatus, GaugeActionStatus, GaugeActionsType, SLDActionsType } from '../../../_models/hmi';
import { GaugeDialogType } from '../../gauge-property/gauge-property.component';
import { Utils } from '../../../_helpers/utils';

declare var SVG: any;
declare var Raphael: any;

@Component({
  selector: 'sld-shapes',
  templateUrl: './sld-shapes.component.html',
  styleUrls: ['./sld-shapes.component.css']
})
export class SldShapesComponent extends GaugeBaseComponent {

  static TypeId = 'sld';
  static TypeTag = 'svg-ext-' + SldShapesComponent.TypeId;      // used to identify shapes type, binded with the library svgeditor
  static LabelTag = 'AnimProcEng';

  static actionsType = {
    open: SLDActionsType.open, close: SLDActionsType.close, intermediate: SLDActionsType.intermediate, bad: SLDActionsType.bad
  };

  constructor() {
    super();
  }

  static getSignals(pro: any) {
    let res: string[] = [];
    if (pro.variableId) {
      res.push(pro.variableId);
    }
    if (pro.alarmId) {
      res.push(pro.alarmId);
    }
    if (pro.actions) {
      pro.actions.forEach(act => {
        res.push(act.variableId);
      });
    }
    return res;
  }

  static getActions() {
    return this.actionsType;
  }

  static getDialogType(): GaugeDialogType {
    return GaugeDialogType.RangeWithAlarm;
  }

  static processValue(ga: GaugeSettings, svgele: any, sig: Variable, gaugeStatus: GaugeStatus) {
    try {
      if (svgele.node) {
        let clr = '';
        let value = parseFloat(sig.value);
        if (Number.isNaN(value)) {
          // maybe boolean
          value = Number(sig.value);
        } else {
          value = parseFloat(value.toFixed(5));
        }
        if (ga.property) {
          if (ga.property.variableId === sig.id && ga.property.ranges) {
            for (let idx = 0; idx < ga.property.ranges.length; idx++) {
              if (ga.property.ranges[idx].min <= value && ga.property.ranges[idx].max >= value) {
                clr = ga.property.ranges[idx].color;
              }
            }
            if (clr) {
              svgele.node.setAttribute('fill', clr);
            }
          }
          // check actions
          if (ga.property.actions) {
            ga.property.actions.forEach(act => {
              if (act.variableId === sig.id) {
                SldShapesComponent.processAction(act, svgele, value, gaugeStatus);
              }
            });
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  static processAction(act: GaugeAction, svgele: any, value: any, gaugeStatus: GaugeStatus) {
    if (act.range.min <= value && act.range.max >= value) {
      var element = SVG.adopt(svgele.node);
      SldShapesComponent.runMyAction(element, act.type, gaugeStatus);
    }
  }

  static runMyAction(element, type, gaugeStatus: GaugeStatus) {
    element.stop(true);
    if (SldShapesComponent.actionsType[type] === SldShapesComponent.actionsType.open) {
      if (eval("$(element.node).find('input').attr('type')") == 'shouche') {
        eval(`$(element.node).find("path[type='switcher']").show()`)
      } else if (eval("$(element.node).find('input').attr('type')") == 'duanluqi') {
        eval(`
        $(element.node).find("path[type='open']").show();
        $(element.node).find("path[type='close']").hide();
        $(element.node).find("path[type='intermediate']").hide();
        `)
      } else if (eval("$(element.node).find('input').attr('type')") == 'jiedikaiguan') {
        eval(`
        $(element.node).find("path[type='open']").show();
        $(element.node).find("path[type='close']").hide();
        $(element.node).find("path[type='intermediate']").hide();
        `)
      }
      console.log({ element, type, gaugeStatus });
    } else if (SldShapesComponent.actionsType[type] === SldShapesComponent.actionsType.close) {
      if (eval("$(element.node).find('input').attr('type')") == 'shouche') {
        eval(`$(element.node).find("path[type='switcher']").hide()`)
      } else if (eval("$(element.node).find('input').attr('type')") == 'duanluqi') {
        eval(`
        $(element.node).find("path[type='open']").hide();
        $(element.node).find("path[type='close']").show();
        $(element.node).find("path[type='intermediate']").hide();
        `)
      } else if (eval("$(element.node).find('input').attr('type')") == 'jiedikaiguan') {
        eval(`
        $(element.node).find("path[type='open']").hide();
        $(element.node).find("path[type='close']").show();
        $(element.node).find("path[type='intermediate']").hide();
        `)
      }
      console.log({ element, type, gaugeStatus });
    } else if (SldShapesComponent.actionsType[type] === SldShapesComponent.actionsType.intermediate) {
      if (eval("$(element.node).find('input').attr('type')") == 'duanluqi') {
        eval(`
        $(element.node).find("path[type='open']").hide();
        $(element.node).find("path[type='close']").hide();
        $(element.node).find("path[type='intermediate']").show();
        `)
      } else if (eval("$(element.node).find('input').attr('type')") == 'jiedikaiguan') {
        eval(`
        $(element.node).find("path[type='open']").hide();
        $(element.node).find("path[type='close']").hide();
        $(element.node).find("path[type='intermediate']").show();
        `)
      }
      console.log({ element, type, gaugeStatus });
    } else if (SldShapesComponent.actionsType[type] === SldShapesComponent.actionsType.bad) {
      if (eval("$(element.node).find('input').attr('type')") == 'duanluqi') {
        eval(`
        $(element.node).find("path[type='open']").show();
        $(element.node).find("path[type='close']").show();
        $(element.node).find("path[type='intermediate']").hide();
        `)
      } else if (eval("$(element.node).find('input').attr('type')") == 'jiedikaiguan') {
        eval(`
        $(element.node).find("path[type='open']").show();
        $(element.node).find("path[type='close']").show();
        $(element.node).find("path[type='intermediate']").hide();
        `)
      }
      console.log({ element, type, gaugeStatus });
    }
  }

  static firstAnimation(element, moveto, movefrom) {
    console.log('a');
    // element.animate(1000).move(moveto.x, moveto.y).animate(1000).move(movefrom.x, movefrom.y).after(function () {
    //     SldShapesComponent.firstAnimation(element, moveto, movefrom);
    // });
    element.animate({ duration: 1000, delay: 6000, wait: 6000 }).move(moveto.x, moveto.y).after(function () {
      console.log('a');
      // element.animate(1000).move(movefrom.x, movefrom.y);
    }).loop();//SldShapesComponent.secondAnimation(element, moveto, movefrom));
  }
  static secondAnimation(element, movefrom, moveto) {
    // element.animate(1000).move(moveto.x, moveto.y).after(SldShapesComponent.firstAnimation(element, moveto, movefrom));
  }
}
