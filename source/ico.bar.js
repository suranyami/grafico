/**
 * Ico - SVG graphing library - bargraph and horizontal bar graph file
 *
 * Copyright (c) 2009 Kilian Valkhof (kilianvalkhof.com) - Originally developed by Alex Young (http://alexyoung.org)
 * Visit ico.kilianvalkhof.com for more information and changelogs.
 * Licensed under the MIT license. http://www.opensource.org/licenses/mit-license.php
 *
 */
"use strict";
Ico.BarGraph = Class.create(Ico.BaseGraph, {
  chartDefaults: function () {
    return {
      bar : true,
      plot_padding : 0,
      bargraph_lastcolour : false,
      bargraph_negativecolour : false
     };
  },
  normaliserOptions: function () {
  },
  setChartSpecificOptions: function () {
    this.bar_padding = 5;
    this.bar_width = this.calculateBarWidth();
    this.options.plot_padding = (this.bar_width / 2);
    this.step = this.calculateStep();
    this.grid_start_offset = this.bar_padding - 1;
  },
  calculateBarWidth: function () {
    return (this.graph_width / this.data_size) - this.bar_padding;
  },
  calculateStep: function () {
    return (this.graph_width - (this.options.plot_padding * 2) - (this.bar_padding * 2)) / (this.data_size - 1);
  },
  drawPlot: function (index, cursor, x, y, colour, coords, datalabel, element) {
    var start_y = this.options.height - this.y_padding_bottom - (this.zero_value * (this.graph_height / this.y_label_count)),
        lastcolor = this.options.bargraph_lastcolour,
        negativecolor = this.options.bargraph_negativecolour,
        colour2;

    x = x + this.bar_padding;
    y = this.options.height - this.y_padding_bottom - y - (this.zero_value * (this.graph_height / this.y_label_count));

    if (lastcolor && index === coords.length-1){
      colour2 = lastcolor;
    } else {
      colour2 = y < 0 ? negativecolor : colour;
    }

    var bargraph = this.paper.rect(x-(this.bar_width/2), start_y, this.bar_width, y).attr({fill: colour2, 'stroke-width': 0, stroke : colour2});

    if( y < 0) {
      bargraph.attr({height:-bargraph.attrs.height});
    } else {
      bargraph.translate(0,-y);
    }

    if (this.options.datalabels) {
      this.drawGraphValueMarkers(x, index, bargraph, datalabel, colour2);
    }

    x = x + this.step;
    this.options.count++;
  },
  drawHorizontalLabels: function () {
  /* Change the standard options to correctly offset against the bars */
    var x_start = this.bar_padding + this.options.plot_padding,
        extra_options = this.options.label_rotation ? {rotation:this.options.label_rotation, translation: -this.options.font_size + " 0"} : {};
    this.drawMarkers(this.options.labels, [1, 0], this.step, x_start, [0, (this.options.font_size + 7) * -1], extra_options);
  },
  drawGrid: function () {
    var path = this.paper.path().attr({ stroke: this.options.grid_colour}),
        y = this.graph_height + this.y_padding_top,
        x, x_labels, x_step;

    if(!this.options.horizontalbar) {
      for (var i = 0; i < this.y_label_count+1; i++) {
        path.moveTo(this.x_padding_left-0.5, parseInt(y, 10)+0.5);
        path.lineTo(this.x_padding_left + this.graph_width-0.5, parseInt(y, 10)+0.5);
        y = y - (this.graph_height / this.y_label_count);
      }
    } else {
      path.moveTo(this.x_padding_left-0.5, parseInt(y, 10)+0.5);
      path.lineTo(this.x_padding_left + this.graph_width-0.5, parseInt(y, 10)+0.5);

      y -= this.graph_height;
      path.moveTo(this.x_padding_left-0.5, parseInt(y, 10)+0.5);
      path.lineTo(this.x_padding_left + this.graph_width-0.5, parseInt(y, 10)+0.5);
    }
    if(this.options.horizontalbar) {
      x = this.x_padding_left + this.options.plot_padding + this.grid_start_offset;
      x_labels = this.y_label_count;
      x_step = this.options.horizontalbar ? this.graph_width / this.y_label_count : this.step;

      for (i = 0; i < x_labels; i++) {
        if ((this.options.hide_empty_label_grid === true && this.options.labels[i] !== "") || this.options.hide_empty_label_grid === false) {
          path.moveTo(parseInt(x, 10), this.y_padding_top);
          path.lineTo(parseInt(x, 10), this.y_padding_top + this.graph_height);
        }
        x = x + x_step;
      }
    }

    //left side
    path.moveTo(parseInt(this.x_padding_left, 10)-0.5, this.y_padding_top);
    path.lineTo(parseInt(this.x_padding_left, 10)-0.5, this.y_padding_top + this.graph_height);
    //right side
    path.moveTo(parseInt(this.x_padding_left + this.graph_width, 10)-0.5, this.y_padding_top);
    path.lineTo(parseInt(this.x_padding_left + this.graph_width, 10)-0.5, this.y_padding_top + this.graph_height);
  },
  drawGraphValueMarkers: function(x, index, bargraph, datalabel, colour) {
   var hover_colour = this.options.hover_colour || colour,
        hoverSet = this.paper.set(),
        text,
        hoverbar = this.paper.rect(x-(this.bar_width/2), this.y_padding_top, this.bar_width, this.options.height);

    datalabel = datalabel[index].toString();
    text = this.paper.text(bargraph.attrs.x+(this.bar_width/2), bargraph.attrs.y-(this.options.font_size*1.5), datalabel);
    hoverbar.attr({fill: colour, 'stroke-width': 0, stroke : colour,opacity:0});
    text.attr({'font-size': this.options.font_size, fill:this.options.hover_text_colour,opacity: 1});

    var textbox = text.getBBox(),
        textpadding = 4,
        roundRect= this.drawRoundRect(text, textbox, textpadding),
        nib = this.drawNib(text, textbox, textpadding);

    text.toFront();
    hoverSet.push(roundRect,nib,text).attr({opacity:0}).toFront();
    hoverbar.toFront();
    this.checkHoverPos({rect:roundRect,set:hoverSet,nib:nib});
    this.globalHoverSet.push(hoverSet);
    this.globalBlockSet.push(hoverbar);
    if (roundRect.attrs.y < 0) {
      hoverSet.translate(0,1+(roundRect.attrs.y*-1));
    }

    hoverbar.node.onmouseover = function (e) {
      bargraph.animate({fill: hover_colour,stroke:hover_colour}, 200);
      hoverSet.animate({opacity:1}, 200);
    }.bind(this);

    hoverbar.node.onmouseout = function (e) {
      bargraph.animate({fill: colour,stroke:colour}, 200);
      hoverSet.animate({opacity:0}, 200);
    };
  }
});

Ico.HorizontalBarGraph = Class.create(Ico.BarGraph, {
  chartDefaults: function () {
    return {
      bar : true,
      horizontalbar : true,
      plot_padding : 0,
      horizontal_rounded : false,
      bargraph_lastcolour : false
    };
  },
  setChartSpecificOptions: function () {
    // Approximate the width required by the labels
    this.x_padding_left = 20 + this.longestLabel() * (this.options.font_size / 2);
    this.bar_padding = 5;
    this.bar_width = this.calculateBarHeight();
    this.step = this.calculateStep();
    this.graph_width = this.options.width - this.x_padding_right - this.x_padding_left;
  },
  normalise: function (value) {
    var range = this.makeValueLabels(this.y_label_count);
    range = range[range.length-1];
    return ((value / range) * this.graph_width);
  },
  longestLabel: function () {
    return $A(this.options.labels).sort(function (a, b) { return a.toString().length < b.toString().length; }).first().toString().length;
  },
  /* Height */
  calculateBarHeight: function () {
    return (this.graph_height / this.data_size) - this.bar_padding;
  },
  calculateStep: function () {
    return (this.graph_height - (this.options.plot_padding * 2)) / this.data_size;
  },
  drawLines: function (label, colour, data, datalabel, element, graphindex) {
    var y = this.y_padding_top + (this.bar_padding/2) -0.5,
        offset = this.zero_value * (this.graph_width / this.y_label_count),
        x = this.x_padding_left + offset - 0.5,
        lastcolor = this.options.bargraph_lastcolour,
        negativecolor = this.options.bargraph_negativecolour;
    this.datalabel = datalabel;

    $A(data).each(function (value, index) {
      var colour2,
          horizontal_rounded = this.options.horizontal_rounded ? this.bar_width/2 : 0,
          bargraph;

      if (lastcolor && index === data.length-1){
        colour2 = lastcolor;
      } else {
        colour2 = value < 0 ? negativecolor : colour;
      }

      value = value / this.graph_width * (this.graph_width - offset);
      bargraph = this.paper.rect(x, y, value, this.bar_width, horizontal_rounded).attr({fill: colour2, 'stroke-width': 0, stroke : colour2});

      if(value < 0) {
        bargraph.attr({width:-bargraph.attrs.width}).translate(value,0);
      }

      if (horizontal_rounded){
        var bargraphset = this.paper.set();
            bargraph2 = this.paper.rect(x, y, value - this.bar_width/2, this.bar_width);
            bargraph2.attr({fill: colour2, 'stroke-width': 0, stroke : colour2});
        bargraph.toFront();
        bargraphset.push(bargraph2, bargraph);

        if(value < 0) {
          bargraph2.attr({width: -bargraph2.attrs.width - this.bar_width}).translate(value + this.bar_width/2, 0);
        }
      }

      if (this.options.datalabels) {
      var hover_colour = this.options.hover_colour || colour2,
          hoverSet = this.paper.set(),
          text,
          hoverbar = this.paper.rect(this.x_padding_left,
                                    y,
                                    this.graph_width,
                                    this.bar_width);

        datalabel = this.datalabel[index].toString();
        text = this.paper.text(offset + value + this.x_padding_left/2, bargraph.attrs.y - (this.options.font_size*1.5), datalabel);
        hoverbar.attr({fill: colour2, 'stroke-width': 0, stroke : colour2,opacity:0});
        text.attr({'font-size': this.options.font_size, fill:this.options.hover_text_colour,opacity: 1});
        if(value < 0) {text.translate(text.getBBox().width, 0);}

        var textbox = text.getBBox(),
            textpadding = 4,
            roundRect= this.drawRoundRect(text, textbox, textpadding),
            nib = this.drawNib(text, textbox, textpadding);

        text.toFront();
        hoverSet.push(roundRect,nib,text).attr({opacity:0}).toFront();
        hoverbar.toFront();
        this.checkHoverPos({rect:roundRect,set:hoverSet,nib:nib});
        this.globalHoverSet.push(hoverSet);
        this.globalBlockSet.push(hoverbar);
        if (roundRect.attrs.y < 0) {
          hoverSet.translate(0,1+(roundRect.attrs.y*-1));
        }

        hoverbar.node.onmouseover = function (e) {
          bargraphset.animate({fill: hover_colour,stroke:hover_colour}, 200);
          hoverSet.animate({opacity:1}, 200);
        }.bind(this);

        hoverbar.node.onmouseout = function (e) {
          bargraphset.animate({fill: colour2,stroke:colour2}, 200);
          hoverSet.animate({opacity:0}, 200);
        };
      }
      y = y + this.step;
    }.bind(this));
  },

  /* Horizontal version */
  drawFocusHint: function () {
    var length = 5,
        x = this.x_padding_left+length*2,
        y = this.options.height - this.y_padding_bottom-length/2,
        cursor = this.paper.path().attr({stroke: this.options.label_colour, 'stroke-width': 2}).moveTo(x, y).lineTo(x - length, y + length).moveTo(x - length, y).lineTo(x - (length * 2), y + length);
  },

  drawVerticalLabels: function () {
    var y_start = (this.step / 2),
        extra_options = this.options.label_rotation ? {"text-anchor": 'end', rotation:this.options.label_rotation, translation: "0 " + this.options.font_size/2} : {"text-anchor": 'end'};
    this.drawMarkers(this.options.labels.reverse(), [0, -1], this.step, y_start, [-8, -(this.options.font_size / 5)], extra_options);
  },

  drawHorizontalLabels: function () {
    var x_step = this.graph_width / this.y_label_count,
        x_labels = this.makeValueLabels(this.y_label_count);
    if (this.options.vertical_label_unit) {
      for(var i=0;i<x_labels.length;i++) {
        x_labels[i] += this.options.vertical_label_unit;
      }
    }
    this.drawMarkers(x_labels, [1, 0], x_step, x_step, [0, (this.options.font_size + 7) * -1]);
  },
  drawMeanLine: function (data) {
  var cursor = this.paper.path().attr(this.options.meanline),
      offset = $A(data).inject(0, function (value, sum) { return sum + value; }) / data.length;
      offset = this.options.bar ? offset + (this.zero_value * (this.graph_height / this.y_label_count)) : offset;

      cursor.moveTo(this.x_padding_left - 1 + offset, this.y_padding_top).lineTo(this.x_padding_left - 1 + offset, this.y_padding_top + this.graph_height);
  }
});

