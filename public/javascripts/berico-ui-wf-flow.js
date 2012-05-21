(function() {
  var ResourceStep, Step, flow, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  if (typeof require !== "undefined" && require !== null) {
    _ = (require("./underscore.js"))._;
  }

  Step = (function() {
    var global_step_id;

    global_step_id = 0;

    function Step(prototype) {
      var _ref, _ref2, _ref3, _ref4;
      _.extend(typeof this !== "undefined" && this !== null ? this : {}, prototype);
      this.id = (_ref = this.id) != null ? _ref : "step_" + (++global_step_id);
      this.name = (_ref2 = this.name) != null ? _ref2 : this.id;
      this.to = (_ref3 = this.to) != null ? _ref3 : null;
      this.from = (_ref4 = this.from) != null ? _ref4 : null;
    }

    return Step;

  })();

  ResourceStep = (function(_super) {

    __extends(ResourceStep, _super);

    function ResourceStep(prototype) {
      var _ref, _ref2, _ref3;
      ResourceStep.__super__.constructor.call(this, prototype);
      this.resource = (_ref = this.resource) != null ? _ref : {};
      this.resource.path = (_ref2 = this.resource.path) != null ? _ref2 : null;
      this.resource.context = (_ref3 = this.resource.context) != null ? _ref3 : null;
    }

    return ResourceStep;

  })(Step);

  if (typeof exports !== "undefined" && exports !== null) {
    flow = exports;
  } else {
    flow = window;
  }

  flow.Step = Step;

  flow.ResourceStep = ResourceStep;

}).call(this);
