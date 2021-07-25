
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
    name: 'shouche1', ico: 'assets/lib/svgeditor/shapes/sldsvg/shouche1.svg', content: [{ id: '', type: 'type', attr: { type: 'shouche' } }, {
      id: '', type: 'path', attr: {
        d: 'm0.339568,1.144924c-0.0458,1.80611 1.3836,3.30982 3.18972,3.35559c1.80611,0.0458 3.3093,-1.38362 3.35507,-3.18973l-0.19682,-0.005c-0.0431,1.69976 -1.45354,3.04252 -3.1533,2.99944c-1.69978,-0.0431 -3.04247,-1.4556 -2.99939,-3.15536l-0.19528,-0.00494z',
        stroke: "#92d050",
        fill: "#92d050"
      }
    }, {
      id: '', type: 'path', attr: {
        switcher: 'switcher',
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
  }, {
    name: 'shouche2', ico: 'assets/lib/svgeditor/shapes/sldsvg/shouche2.svg', content: [{ id: '', type: 'type', attr: { type: 'shouche' } }, {
      id: '', type: 'path', attr: {
        d: 'm0.339568,1.144924c-0.0458,1.80611 1.3836,3.30982 3.18972,3.35559c1.80611,0.0458 3.3093,-1.38362 3.35507,-3.18973l-0.19682,-0.005c-0.0431,1.69976 -1.45354,3.04252 -3.1533,2.99944c-1.69978,-0.0431 -3.04247,-1.4556 -2.99939,-3.15536l-0.19528,-0.00494z',
        stroke: "#a9a9a9",
        fill: "#a9a9a9"
      }
    }, {
      id: '', type: 'path', attr: {
        switcher: 'switcher',
        d: "m2.338798,0.123794l2.59841,0l0,2.59841l-2.59841,0l0,-2.59841z",
        stroke: "#a9a9a9",
        fill: "#a9a9a9"
      }
    }, {
      id: '', type: 'path', attr: {
        d: "m3.613666,4.501585c0,0.881935 0,1.763879 0,2.645833",
        fill: "#a9a9a9",
        stroke: "#a9a9a9",
        'stroke-width': 5
      }
    }]
  }, {
    name: 'ct1', ico: 'assets/lib/svgeditor/shapes/sldsvg/ct1.svg', content: [{ id: '', type: 'type', attr: { type: 'ct' } }, {
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
        switcher: 'switcher',
        d: "m3.35259,0.1399c0,4.40967 0,8.81939 0,13.22917",
        stroke: "#92d050",
        fill: "#92d050",
        'stroke-width': 5,
      }
    }]
  }, {
    name: 'ct2', ico: 'assets/lib/svgeditor/shapes/sldsvg/ct2.svg', content: [{ id: '', type: 'type', attr: { type: 'ct' } }, {
      id: '', type: 'circle', attr: {
        r: "3.175",
        cy: "6.74439",
        cx: "3.35259",
        stroke: "#a9a9a9",
        fill: "none",
        "stroke-width": 5,
      }
    }, {
      id: '', type: 'path', attr: {
        switcher: 'switcher',
        d: "m3.35259,0.1399c0,4.40967 0,8.81939 0,13.22917",
        stroke: "#a9a9a9",
        fill: "#a9a9a9",
        'stroke-width': 5,
      }
    }]
  }
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