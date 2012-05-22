(function() {
  var Flow, ResourceStep, Sequence, Step, Utils, flow, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  if (typeof require !== "undefined" && require !== null) {
    _ = (require("./underscore.js"))._;
  }

  Utils = (function() {

    function Utils() {}

    Utils.normalize_handlers = function(handlers) {
      if (handlers != null) {
        return Utils.arrayify(handlers);
      } else {
        return [];
      }
    };

    Utils.arrayify = function(items) {
      if ((items.push != null) && (items.length != null)) {
        return items;
      } else {
        return [items];
      }
    };

    Utils.fire = function(handlers, this_obj) {
      var handler, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = handlers.length; _i < _len; _i++) {
        handler = handlers[_i];
        _results.push(handler.apply(this_obj, [this_obj]));
      }
      return _results;
    };

    return Utils;

  })();

  /*
  	The simplest Node in the Finite State Machine "flow" model.
  */

  Step = (function() {

    Step.global_step_id = 0;

    Step.states = [
      {
        name: "never_seen",
        weight: -2
      }, {
        name: "preload",
        weight: -1
      }, {
        name: "loaded",
        weight: 0
      }, {
        name: "validated",
        weight: 1
      }, {
        name: "pretrans",
        weight: 2
      }, {
        name: "posttrans",
        weight: 3
      }
    ];

    function Step(prototype) {
      var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      _.extend(typeof this !== "undefined" && this !== null ? this : {}, prototype);
      this.id = (_ref = this.id) != null ? _ref : "step_" + (++Step.global_step_id);
      this.name = (_ref2 = this.name) != null ? _ref2 : this.id;
      this.async = (_ref3 = this.async) != null ? _ref3 : false;
      this.to = (_ref4 = this.to) != null ? _ref4 : null;
      this.from = (_ref5 = this.from) != null ? _ref5 : null;
      this.state = (_ref6 = this.state) != null ? _ref6 : Step.get_state_by_name("never_seen");
      this.validate = (_ref7 = this.validate) != null ? _ref7 : function() {
        return true;
      };
      this.on_loading = Utils.normalize_handlers(this.on_loading);
      this.on_load = Utils.normalize_handlers(this.on_load);
      this.on_validating = Utils.normalize_handlers(this.on_validating);
      this.on_validated = Utils.normalize_handlers(this.on_validated);
      this.on_not_validated = Utils.normalize_handlers(this.on_not_validated);
      this.on_leaving = Utils.normalize_handlers(this.on_leaving);
      this.on_leave = Utils.normalize_handlers(this.on_leave);
    }

    Step.get_state_by_name = function(name) {
      var state, _i, _len, _ref;
      _ref = Step.states;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        state = _ref[_i];
        if (state.name = name) return state;
      }
      return null;
    };

    Step.get_state_by_weight = function(weight) {
      var state, _i, _len, _ref;
      _ref = Step.states;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        state = _ref[_i];
        if (state.weight = weight) return state;
      }
      return null;
    };

    Step.prototype.set_state = function(name) {
      var state_ctx;
      state_ctx = Step.get_state_by_name(name);
      if (state_ctx != null) return this.state = state_ctx;
    };

    Step.prototype.length = function() {
      return 1;
    };

    Step.prototype.is_valid = function() {
      var validated;
      Utils.fire(this.on_validating);
      validated = this.validate.apply(this);
      if (validated) {
        this.set_state("validated");
        return Utils.fire(this.on_validated);
      } else {
        return Utils.fire(this.on_not_validated);
      }
    };

    Step.prototype.is_done = function() {
      return this.is_valid();
    };

    Step.prototype.load = function() {
      this.set_state("preload");
      Utils.fire(this.on_loading);
      this.set_state("loaded");
      return Utils.fire(this.on_load);
    };

    Step.prototype.unload = function() {
      this.set_state("pretrans");
      Utils.fire(this.on_leaving);
      this.set_state("posttrans");
      return Utils.fire(this.on_leave);
    };

    return Step;

  })();

  /*
  	Defines a step that manipulates a specific resource
  */

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

  /*
  	Defines a collection of Steps that are executed in Sequence
  */

  Sequence = (function(_super) {

    __extends(Sequence, _super);

    function Sequence(prototype) {
      var _ref;
      Sequence.__super__.constructor.call(this, prototype);
      this.current_position = -1;
      this.steps = (_ref = this.steps) != null ? _ref : [];
      this.rectify();
    }

    Sequence.prototype.rectify = function() {
      var _ref;
      if (this.current_position === -1 && this.steps.length > 0) {
        this.current_position = 0;
      }
      if ((0 <= (_ref = this.current_position) && _ref < this.steps.length)) {
        return this.current = this.steps[this.current_position];
      } else {
        return this.current = null;
      }
    };

    Sequence.prototype.has_next = function() {
      return (this.current_position + 1) < this.steps.length;
    };

    Sequence.prototype.next = function() {
      if (this.has_next()) {
        this.current_position++;
        return this.rectify();
      }
    };

    Sequence.prototype.has_previous = function() {
      return this.current_position - 1 >= 0;
    };

    Sequence.prototype.previous = function() {
      if (this.has_previous()) {
        this.current_position--;
        return this.rectify();
      }
    };

    Sequence.prototype.get = function(position) {
      if (this.steps.length === 0) {
        return null;
      } else if ((0 <= position && position < this.steps.length)) {
        return this.steps[position];
      } else {
        return null;
      }
    };

    Sequence.prototype.append_all = function(steps) {
      var step, _i, _len;
      for (_i = 0, _len = steps.length; _i < _len; _i++) {
        step = steps[_i];
        this.append(step, false);
      }
      return this.rectify();
    };

    Sequence.prototype.append = function(step, do_rectify) {
      if (do_rectify == null) do_rectify = true;
      this.steps.push(step);
      if (do_rectify) return this.rectify();
    };

    Sequence.prototype.length = function() {
      var combined_length, step, step_length, _i, _len, _ref;
      combined_length = 0;
      _ref = this.steps;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        step = _ref[_i];
        if (step.length != null) {
          step_length = step.length();
        } else {
          step_length = 1;
        }
        combined_length += step_length;
      }
      return combined_length;
    };

    return Sequence;

  })(Step);

  /*
  	Defines the root container of Steps and the basic object developers
  	will interact with when commanding the UI Flow.
  */

  Flow = (function() {

    function Flow(initial_state) {
      var _ref;
      initial_state = initial_state != null ? initial_state : {};
      this.id = (_ref = initial_state.id) != null ? _ref : "adhoc";
      this.current = {
        position: -1,
        step: null
      };
      this.root_seq = new Sequence();
      if (initial_state.steps != null) {
        this.root_seq.append_all(initial_state.steps);
      }
      this.update();
    }

    Flow.prototype.update = function(step_array) {
      this.current.position = this.root_seq.current_position;
      return this.current.step = this.root_seq.current;
    };

    Flow.prototype.forward = function() {
      this.root_seq.next();
      return this.update();
    };

    Flow.prototype.back = function() {
      this.root_seq.previous();
      return this.update();
    };

    Flow.prototype.length = function() {
      return this.root_seq.length();
    };

    return Flow;

  })();

  if (typeof exports !== "undefined" && exports !== null) {
    flow = exports;
  } else {
    flow = window;
  }

  flow.Utils = Utils;

  flow.Step = Step;

  flow.ResourceStep = ResourceStep;

  flow.Sequence = Sequence;

  flow.Flow = Flow;

}).call(this);
