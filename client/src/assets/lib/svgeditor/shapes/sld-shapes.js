
// add the shape library: with file name as parameter (have to be unique)
(function () {
  'use strict';
  var shapesGroupName = 'editor.sld';     // used to organize and gropping the shapes, displayed in editor menu as label with expand/collapse 
  var typeId = 'sld';              // used to identify shapes type, 'shapes' is binded with angular component 'ShapesComponent'
  // if you make a new type you have to implement the angular component too 

  // add in this array your schapes data, the shape object has the following attributes:
  // 'name': is unique for shape type
  // 'ico': path icon displayed in editor menu
  // 'content': array of svg element 
  // 'id': element id used if you like make a animation managed in angular component
  // 'type': svg element type (path, text, ellipse,...) see svg description
  // 'attr': element attribute, depending of type

  var shapes = [{
    name: 'truck', ico: 'assets/lib/svgeditor/shapes/sldsvg/truck.svg', content: [{ id: '', type: 'input', attr: { type: 'shouche' } }, {
      id: '', type: 'path', attr: {
        d: 'm0.339568,1.144924c-0.0458,1.80611 1.3836,3.30982 3.18972,3.35559c1.80611,0.0458 3.3093,-1.38362 3.35507,-3.18973l-0.19682,-0.005c-0.0431,1.69976 -1.45354,3.04252 -3.1533,2.99944c-1.69978,-0.0431 -3.04247,-1.4556 -2.99939,-3.15536l-0.19528,-0.00494z',
        stroke: "#92d050",
        fill: "#92d050"
      }
    }, {
      id: '', type: 'path', attr: {
        type: 'switcher',
        d: "m2.338798,0.123794l2.59841,0l0,2.59841l-2.59841,0l0,-2.59841z",
        stroke: "#92d050",
        fill: "#92d050"
      }
    }, {
      id: '', type: 'path', attr: {
        d: "m3.613666,4.501585c0,0.881935 0,1.763879 0,2.645833",
        fill: "#92d050",
        stroke: "#92d050",
        'stroke-width': 5
      }
    }]
  },{
    name: 'ct', ico: 'assets/lib/svgeditor/shapes/sldsvg/ct.svg', content: [{ id: '', type: 'input', attr: { type: 'ct' } }, {
      id: '', type: 'circle', attr: {
        r: "3.175",
        cy: "6.74439",
        cx: "3.35259",
        stroke: "#92d050",
        fill: "none",
        "stroke-width": 5,
      }
    }, {
      id: '', type: 'path', attr: {
        d: "m3.35259,0.1399c0,4.40967 0,8.81939 0,13.22917",
        stroke: "#92d050",
        fill: "#92d050",
        'stroke-width': 5,
      }
    }]
  }, {
    name: 'feederAndIncomer', ico: 'assets/lib/svgeditor/shapes/sldsvg/feederAndIncomer.svg', content: [{ id: '', type: 'input', attr: { type: 'jinxianchuxian' } }, {
      id: '', type: 'path', attr: {
        stroke: "#92d050",
        fill: "#92d050",
        d: "m 139.17096,170.98447 -4.49972,0.001 -4.49972,0.001 2.24861,-3.8976 2.24862,-3.89759 2.2511,3.89615 z",
        transform: "matrix(0.61739936,0,0,0.71277948,-80.311027,-116.31255)",
      }
    }]
  }, {
    name: 'pt', ico: 'assets/lib/svgeditor/shapes/sldsvg/pt.svg', content: [{ id: '', type: 'input', attr: { type: 'pt' } }, {
      id: '', type: 'path', attr: {
        'stroke-width': 5,
        stroke: "#92d050",
        fill: "#92d050",
        d: "m 7.9415887,4.9167315 c 0,1.322902 0,2.645818 0,3.96875",
      }
    }, {
      id: '', type: 'circle', attr: {
        r: "3.175",
        cy: "15.076933",
        cx: "10.647635",
        stroke: '#92d050',
        fill: 'none',
        'stroke-width': 5,
      }
    }, {
      id: '', type: 'circle', attr: {
        r: "3.175",
        cy: "12.060362",
        cx: "7.9138403",
        stroke: '#92d050',
        fill: 'none',
        'stroke-width': 5,
      }
    }, {
      id: '', type: 'circle', attr: {
        r: "3.175",
        cy: "15.080763",
        cx: "5.1292562",
        stroke: '#92d050',
        fill: 'none',
        'stroke-width': 5,
      }
    }]
  }, {
    name: 'earth', ico: 'assets/lib/svgeditor/shapes/sldsvg/earth.svg', content: [{ id: '', type: 'input', attr: { type: 'jiedi' } }, {
      id: '', type: 'path', attr: {
        'stroke-width': 5,
        stroke: "#ffff00",
        fill: "#ffff00",
        d: "m 11.216166,12.621519 c -3.5496193,2.6e-4 -7.0992713,2.6e-4 -10.64896467,0",
      }
    }, {
      id: '', type: 'path', attr: {
        'stroke-width': 5,
        stroke: "#ffff00",
        fill: "#ffff00",
        d: "m 11.142426,4.5309512 c 2.65e-4,5.467044 2.65e-4,10.9341448 0,16.4013118",
      }
    }, {
      id: '', type: 'path', attr: {
        'stroke-width': 5,
        stroke: "#ffff00",
        fill: "#ffff00",
        d: "m 15.776892,7.7980993 c 2.65e-4,3.3141797 2.65e-4,6.6283927 0,9.9426467",
      }
    }, {
      id: '', type: 'path', attr: {
        'stroke-width': 5,
        stroke: "#ffff00",
        fill: "#ffff00",
        d: "m 20.263446,9.6716057 c 2.65e-4,2.1309253 2.65e-4,4.2618723 0,6.3928453",
      }
    },]
  }, {
    name: 'busbar', ico: 'assets/lib/svgeditor/shapes/sldsvg/busbar.svg', content: [{ id: '', type: 'input', attr: { type: 'muxian' } }, {
      id: '', type: 'path', attr: {
        'stroke-width': 5,
        stroke: "#92d050",
        fill: "#92d050",
        d: "m 23.561879,14.569378 c -7.689208,0 -15.3785026,0 -23.06788579,0",
      }
    },]
  }, {
    name: 'circuitBreaker', ico: 'assets/lib/svgeditor/shapes/sldsvg/circuitBreaker.svg', content: [{ id: '', type: 'input', attr: { type: 'duanluqi' } }, {
      id: '', type: 'path', attr: {
        'stroke-width': 5,
        stroke: "#92d050",
        fill: "#92d050",
        d: "m 14.295985,27.94559 c 0,1.54344 0,3.08696 0,4.63044",
      }
    }, {
      id: '', type: 'path', attr: {
        'stroke-width': 5,
        stroke: "#92d050",
        fill: "#92d050",
        d: "m 14.276013,8.69154 c 0,1.33392 0,2.66789 0,4.00182",
      }
    }, {
      id: '', type: 'path', attr: {
        'stroke-width': 5,
        stroke: "#92d050",
        fill: "#92d050",
        d: "m 12.689077,11.12306 3.287375,3.01636",
      }
    }, {
      id: '', type: 'path', attr: {
        'stroke-width': 5,
        stroke: "#92d050",
        fill: "#92d050",
        d: "m 12.610806,14.13942 3.483052,-2.98045",
      }
    }, {
      id: '', type: 'path', attr: {
        type: 'close',
        'stroke-width': 5,
        stroke: "#92d050",
        fill: "#92d050",
        d: "m 8.638894,16.66172 c 1.885641,3.76118 3.771338,7.52247 5.657091,11.28387",
      }
    }, {
      id: '', type: 'path', attr: {
        type: 'open',
        'stroke-width': 5,
        stroke: "#92d050",
        fill: "#92d050",
        d: "m 14.295985,12.89718 c 0,5.01601 0,10.03227 0,15.04841",
      }
    }, {
      id: '', type: 'path', attr: {
        type: 'intermediate',
        'stroke-width': 5,
        stroke: "#92d050",
        fill: "#92d050",
        d: "m 17.473168,27.94414 c -2.135653,2.7e-4 -4.271329,2.7e-4 -6.407031,0",
      }
    },]
  }, {
    name: 'disconnector', ico: 'assets/lib/svgeditor/shapes/sldsvg/disconnector.svg', content: [{ id: '', type: 'input', attr: { type: 'jiedikaiguan' } }, {
      id: '', type: 'path', attr: {
        d: "m 16.516625,4.8451356 c 0,0.822645 0,1.645333 0,2.467999",
        stroke: "#ffc000",
        fill: "#ffc000",
        'stroke-width': 5,
      }
    }, {
      id: '', type: 'path', attr: {
        d: "m 23.969525,6.2548006 c -2.484272,2.7e-4 -4.968572,2.7e-4 -7.4529,0",
        stroke: "#ffc000",
        fill: "#ffc000",
        'stroke-width': 5,
      }
    }, {
      id: '', type: 'path', attr: {
        d: "m 3.8166209,6.2548006 c -1.1943793,2.7e-4 -2.3887712,2.7e-4 -3.58317952,0",
        stroke: "#ffc000",
        fill: "#ffc000",
        'stroke-width': 5,
      }
    }, {
      id: '', type: 'path', attr: {
        type: 'close',
        d: "M 3.8166209,6.2548006 C 7.657821,4.0771656 11.498757,1.8992656 15.339428,-0.27889868",
        stroke: "#ffc000",
        fill: "#ffc000",
        'stroke-width': 5,
      }
    }, {
      id: '', type: 'path', attr: {
        type: 'open',
        d: "m 16.516625,6.2548006 c -4.233286,2.7e-4 -8.4666158,2.7e-4 -12.7000041,0",
        stroke: "#ffc000",
        fill: "#ffc000",
        'stroke-width': 5,
      }
    }, {
      id: '', type: 'path', attr: {
        type: 'intermediate',
        d: "m 3.8166206,4.8451356 c 2.65e-4,0.822645 2.65e-4,1.645333 0,2.467999",
        stroke: "#ffc000",
        fill: "#ffc000",
        'stroke-width': 5,
      }
    }]
  },
  ];

  for (var i = 0; i < shapes.length; i++) {
    shapes[i].name = typeId + '-' + shapes[i].name;
  }
  if (svgEditor.shapesGrps[shapesGroupName]) {
    for (var i = 0; i < shapes.length; i++) {
      svgEditor.shapesGrps[shapesGroupName].push(shapes[i]);
    }
  } else {
    svgEditor.shapesGrps[shapesGroupName] = shapes;
  }
}());