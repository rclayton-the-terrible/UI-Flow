(function() {
  var Flow, ResourceStep, Sequence, Step, flow, _,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  if (typeof require !== "undefined" && require !== null) {
    _ = (require("./underscore.js"))._;
  }

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
      this.length = 0;
      this.steps = (_ref = this.steps) != null ? _ref : [];
      this.rectify();
    }

    Sequence.prototype.rectify = function() {
      var _ref;
      if (this.current_position === -1 && this.steps.length > 0) {
        this.current_position = 0;
      }
      if ((0 <= (_ref = this.current_position) && _ref < this.steps.length)) {
        this.current = this.steps[this.current_position];
      } else {
        this.current = null;
      }
      return this.length = this.steps.length;
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
      this.sequence = new Sequence();
      if (initial_state.steps != null) {
        this.sequence.append_all(initial_state.steps);
      }
      this.update();
    }

    Flow.prototype.update = function(step_array) {
      this.current.position = this.sequence.current_position;
      return this.current.step = this.sequence.current;
    };

    Flow.prototype.forward = function() {
      this.sequence.next();
      return this.update();
    };

    Flow.prototype.back = function() {
      this.sequence.previous();
      return this.update();
    };

    return Flow;

  })();

  if (typeof exports !== "undefined" && exports !== null) {
    flow = exports;
  } else {
    flow = window;
  }

  flow.Step = Step;

  flow.ResourceStep = ResourceStep;

  flow.Sequence = Sequence;

  flow.Flow = Flow;

}).call(this);
