[{
  Name: "Fibaro RGBW",
  Author: "DaniMail",
  Version: "03  2015-06-18",

  GroupName: '',
  IconImage: 'pages/control/widgets/homegenie/generic/images/icons/colorbulbs.png',
  StatusText: '',
  Description: '',
  UpdateTime: '',
  HueLightNumber: '',
  ColorWheel: null,
  WidgetImage: null,
  ControlImage: null,

  RenderView: function (cuid, module) {
    if (cuid == null) return;
    var container = $(cuid);
    var widget = container.find('[data-ui-field=widget]');
    var controlpopup = widget.data('ControlPopUp');
    //
    var deviceaddress = module.Address;
    //
    // create and store a local reference to control popup object
    //
    if (!controlpopup) {
      container.find('[data-ui-field=controlpopup]').trigger('create');
      controlpopup = container.find('[data-ui-field=controlpopup]').popup();
      widget.data('ControlPopUp', controlpopup);
      //
      this.ControlImage = Raphael(widget.find('[data-ui-field=colorball]').get(0));
      //
      // initialization stuff here
      //
      // when options button is clicked control popup is shown
      widget.find('[data-ui-field=options]').on('click', function () {
        if ($(cuid).find('[data-ui-field=widget]').data('ControlPopUp')) {
          $(cuid).find('[data-ui-field=widget]').data('ControlPopUp').popup('open');
        }
      });
      //
      // ui events handlers
      //
      widget.find('[data-ui-field=on]').on('click', function () {
        HG.Control.Modules.ServiceCall("Control.On", module.Domain, module.Address, null, function (data) { });
      });
      widget.find('[data-ui-field=off]').on('click', function () {
        HG.Control.Modules.ServiceCall("Control.Off", module.Domain, module.Address, null, function (data) { });
      });
      // toggle button action
      widget.find('[data-ui-field=toggle]').on('click', function () {
        if ($(cuid).find('[data-ui-field=widget]').data('ControlPopUp')) {
          $(cuid).find('[data-ui-field=widget]').data('ControlPopUp').popup('open');
        }
        //HG.Control.Modules.ServiceCall("Control.Toggle", module.Domain, module.Address, null, function (data) { });
      });          
      // level slider action
      widget.find('[data-ui-field=level]').on('slidestop', function () {
        HG.Control.Modules.ServiceCall("Control.Level", module.Domain, module.Address, $(this).val(), function (data) { });
      });          
      controlpopup.find('[data-ui-field=on]').on('click', function () {
        HG.Control.Modules.ServiceCall("Control.On", module.Domain, module.Address, null, function (data) { });
      });
      controlpopup.find('[data-ui-field=off]').on('click', function () {
        HG.Control.Modules.ServiceCall("Control.Off", module.Domain, module.Address, null, function (data) { });
      });
      //
      controlpopup.find('[data-ui-field=prg6]').on('click', function () {
        HG.Control.Modules.ServiceCall("Control.ProgramRGB",module.Domain, module.Address, "6", function (data) { });
      });
      controlpopup.find('[data-ui-field=prg7]').on('click', function () {
        HG.Control.Modules.ServiceCall("Control.ProgramRGB",module.Domain, module.Address, "7", function (data) { });
      });
      controlpopup.find('[data-ui-field=prg8]').on('click', function () {
        HG.Control.Modules.ServiceCall("Control.ProgramRGB",module.Domain, module.Address, "8", function (data) { });
      });
      controlpopup.find('[data-ui-field=prg9]').on('click', function () {
        HG.Control.Modules.ServiceCall("Control.ProgramRGB",module.Domain, module.Address, "9", function (data) { });
      });
      controlpopup.find('[data-ui-field=prg10]').on('click', function () {
        HG.Control.Modules.ServiceCall("Control.ProgramRGB",module.Domain, module.Address, "10", function (data) { });
      });
      var _this = this;
      this.ColorWheel = Raphael.colorwheel(controlpopup.find('[data-ui-field=colors]'), 200, 80);
      this.ColorWheel.ondrag(null, function (rgbcolor) {
        var color = Raphael.color(rgbcolor);
        var red = Math.round(color.r);
        var green = Math.round(color.g);
        var blue = Math.round(color.b);
        var srgbcolor = red + "," + green + "," + blue;
        _this.ControlImage.clear();_this.ControlImage.ball(12, 12, 12, color);
        //
        HG.Control.Modules.ServiceCall("Control.ColorRgb",module.Domain, module.Address, srgbcolor, function (data) { });
      });
    }
    //
    //
    // settings button
    widget.find('[data-ui-field=settings]').on('click', function () {
      HG.WebApp.Control.EditModule(module);
    });
    //
    // read some context data
    //
    this.GroupName = container.attr('data-context-group');
    //
    // get module watts prop
    //
    var watts = HG.WebApp.Utility.GetModulePropertyByName(module, "Meter.Watts");
    if (watts != null) {
      var w = Math.round(watts.Value.replace(',', '.'));
      if (w > 0) {
        watts = w + '<span style="opacity:0.65">W</span>';
      } else watts = '';
    } else watts = '';
    //
    // get module level prop for status text
    //
    var level = HG.WebApp.Utility.GetModulePropertyByName(module, "Status.Level");
    if (level != null) {
      var updatetime = level.UpdateTime;
      if (typeof updatetime != 'undefined') {
        updatetime = updatetime.replace(' ', 'T'); // fix for IE and FF
        var d = new Date(updatetime);
        this.UpdateTime = HG.WebApp.Utility.FormatDate(d) + ' ' + HG.WebApp.Utility.FormatDateTime(d); //HG.WebApp.Utility.GetElapsedTimeText(d);
      }
      level = parseFloat(level.Value.replace(',', '.'))*100;
    } else level = '';
    this.StatusText = '<span style="vertical-align:middle">' + watts + '</span>';
    //
    // set current icon image
    //
    var widgeticon = HG.WebApp.Utility.GetModulePropertyByName(module, 'Widget.DisplayIcon');
    if (widgeticon != null && widgeticon.Value != '') {
      this.IconImage = widgeticon.Value;
    } else {
      this.IconImage = 'pages/control/widgets/homegenie/generic/images/icons/colorbulbs.png';
    }
    var srgbcolor = HG.WebApp.Utility.GetModulePropertyByName(module, "Status.ColorRgb");
    if (srgbcolor != null && this.ColorWheel != null) {
        var rgbcolor = 'rgb('+srgbcolor.Value+')';
        var color = Raphael.rgb2hsb(rgbcolor);
        if (level == 0) color.b = 0; else color.b = 1;
        this.ColorWheel.color(rgbcolor);
        this.ControlImage.clear(); this.ControlImage.ball(12, 12, 12, color);
    }
    //
    this.Description = (module.Domain.substring(module.Domain.lastIndexOf('.') + 1)) + ' ' + module.Address;
    //
    // render widget
    //
    widget.find('[data-ui-field=name]').html(module.Name);
    widget.find('[data-ui-field=description]').html(this.Description);
    widget.find('[data-ui-field=status]').html(this.StatusText);
    widget.find('[data-ui-field=icon]').attr('src', this.IconImage);
    widget.find('[data-ui-field=updatetime]').html(this.UpdateTime);
    widget.find('[data-ui-field=level]').val(level).slider('refresh');
    //
    // render control popup
    //
    controlpopup.find('[data-ui-field=group]').html(this.GroupName);
    controlpopup.find('[data-ui-field=name]').html(module.Name);
    controlpopup.find('[data-ui-field=status]').html(this.StatusText);
  }

}]