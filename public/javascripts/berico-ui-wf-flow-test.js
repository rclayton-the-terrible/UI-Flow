(function() {
  var flow;

  if (typeof require !== "undefined" && require !== null) {
    flow = require("./berico-ui-wf-flow.js");
  }

  if (typeof buster !== "undefined" && buster !== null) buster.spec.expose();

  describe("Flow Test Package", function() {
    var ensureHandlerIsCalled, expectProperStepInitialization, test_context, test_flow;
    test_context = {
      id: "test_step",
      to: "next_item",
      from: "previous_item",
      view: "test_step_view"
    };
    expectProperStepInitialization = function(target, context) {
      var property, value;
      for (property in context) {
        value = context[property];
        expect(target[property]).toEqual(value);
      }
      return null;
    };
    ensureHandlerIsCalled = function(handlerName, spy, initiator) {
      var handlers, step;
      handlers = {};
      handlers[handlerName] = spy;
      step = new flow.Step(handlers);
      initiator(step);
      return expect(spy).toHaveBeenCalled();
    };
    describe("flow.Step", function() {
      it("initializes correctly when provided a full context", function() {
        var step;
        step = new flow.Step(test_context);
        return expectProperStepInitialization(step, test_context);
      });
      it("initialized the id using an incremented id when unavailable", function() {
        var step;
        step = new flow.Step({});
        return expect(step.id).toMatch(/step_[0-9]+/);
      });
      it("sets the name of the node to the id of the node if the name was not provided", function() {
        var step;
        step = new flow.Step({
          id: "1234"
        });
        expect(step.name).toEqual("1234");
        return expect(step.name).toEqual(step.id);
      });
      it("sets the 'to' and 'from' property to null if the properties where not provided", function() {
        var step;
        step = new flow.Step();
        expect(step.to).toBeDefined();
        expect(step.to).toBeNull();
        expect(step.from).toBeNull();
        return expect(step.from).toBeDefined();
      });
      it("should have the state set to 'never_seen' when initialized", function() {
        var step;
        step = new flow.Step();
        expect(step.state.weight).toEqual(-2);
        return expect(step.state.name).toEqual("never_seen");
      });
      it("should return a default no-op validation function when initialized", function() {
        var step;
        step = new flow.Step();
        return expect(step.validate()).toEqual(true);
      });
      it("should default to a synchronous step if no async=true 			value is provided in the context", function() {
        var step;
        step = new flow.Step();
        return expect(step.async).toEqual(false);
      });
      it("should become an asynchronous step if async=true is specified 			in the context", function() {
        var step;
        step = new flow.Step({
          async: true
        });
        return expect(step.async).toEqual(true);
      });
      it("defines a set of empty event handlers if none are provided", function() {
        var step;
        step = new flow.Step();
        expect(step.on_loading).toEqual([]);
        expect(step.on_load).toEqual([]);
        expect(step.on_validating).toEqual([]);
        expect(step.on_validated).toEqual([]);
        expect(step.on_not_validated).toEqual([]);
        expect(step.on_leaving).toEqual([]);
        return expect(step.on_leave).toEqual([]);
      });
      it("properly sets a handler when supplied via context", function() {
        var handlers, step;
        handlers = {
          on_loading: function() {
            return true;
          },
          on_load: function() {
            return true;
          },
          on_validating: function() {
            return true;
          },
          on_validated: function() {
            return true;
          },
          on_not_validated: function() {
            return true;
          },
          on_leaving: function() {
            return true;
          },
          on_leave: function() {
            return true;
          }
        };
        step = new flow.Step(handlers);
        expect(step.on_loading).toEqual([handlers.on_loading]);
        expect(step.on_load).toEqual([handlers.on_load]);
        expect(step.on_validating).toEqual([handlers.on_validating]);
        expect(step.on_validated).toEqual([handlers.on_validated]);
        expect(step.on_not_validated).toEqual([handlers.on_not_validated]);
        expect(step.on_leaving).toEqual([handlers.on_leaving]);
        return expect(step.on_leave).toEqual([handlers.on_leave]);
      });
      it("calls the 'on_loading' handler when the Step is instructed to load", function() {
        return ensureHandlerIsCalled("on_loading", this.spy(), function(step) {
          return step.load();
        });
      });
      it("calls the 'on_load' handler when the Step had been loaded", function() {
        return ensureHandlerIsCalled("on_load", this.spy(), function(step) {
          return step.load();
        });
      });
      it("calls the 'on_validating' handler when the Step had been asked to validate", function() {
        return ensureHandlerIsCalled("on_validating", this.spy(), function(step) {
          return step.is_valid();
        });
      });
      it("calls the 'on_validated' handler when the Step had been validated", function() {
        return ensureHandlerIsCalled("on_validated", this.spy(), function(step) {
          return step.is_valid();
        });
      });
      it("calls the 'on_not_validated' handler when the Step had failed to validate", function() {
        var context, on_not_validated_handler, on_validated_handler, on_validating_handler, step;
        on_not_validated_handler = this.spy();
        on_validating_handler = this.spy();
        on_validated_handler = this.spy();
        context = {
          on_not_validated: on_not_validated_handler,
          on_validated: on_validated_handler,
          on_validating: on_validating_handler,
          validate: function() {
            return false;
          }
        };
        step = new flow.Step(context);
        step.is_valid();
        expect(on_validating_handler).toHaveBeenCalled();
        expect(on_not_validated_handler).toHaveBeenCalled();
        return refute.called(on_validated_handler);
      });
      it("normalizes a null handler to an empty array", function() {
        return expect(flow.Step.normalize_handlers(null)).toEqual([]);
      });
      it("normalizes a single handler to an array of handlers", function() {
        var handler;
        handler = function() {
          return true;
        };
        return expect(flow.Step.normalize_handlers(handler)).toEqual([handler]);
      });
      return it("turns an object into a single item array, or if the 			object is an array, simply returns it", function() {
        var test_array;
        test_array = [1, 2, 3];
        expect(flow.Step.arrayify(test_array)).toEqual(test_array);
        return expect(flow.Step.arrayify(1)).toEqual([1]);
      });
    });
    describe("flow.ResourceStep", function() {
      it("initializes resources using the parent constructor", function() {
        var rstep;
        rstep = new flow.ResourceStep(test_context);
        return expectProperStepInitialization(rstep, test_context);
      });
      return it("should initialize the resource object with 'null' path and context values when not specified", function() {
        var rstep;
        rstep = new flow.ResourceStep();
        expect(rstep.resource).toBeDefined();
        expect(rstep.resource.path).toBeDefined();
        expect(rstep.resource.path).toBeNull();
        expect(rstep.resource.context).toBeDefined();
        return expect(rstep.resource.context).toBeNull();
      });
    });
    test_flow = {
      id: "test_flow",
      steps: [
        {
          type: "Step",
          view: "/template1.txt"
        }, {
          type: "Step",
          view: "/template2.txt"
        }, {
          type: "Step",
          view: "/template3.txt"
        }, {
          type: "Step",
          view: "/template4.txt"
        }
      ]
    };
    describe("flow.Sequence", function() {
      var expectProperSequenceState;
      expectProperSequenceState = function(seq, current_position, length, current_step) {
        expect(seq.current_position).toEqual(current_position);
        expect(seq.length()).toEqual(length);
        if (current_step != null) {
          return expect(seq.current).toEqual(current_step);
        } else {
          expect(seq.current).toBeDefined();
          return expect(seq.current).toBeNull();
        }
      };
      it("properly initializes with no provided state", function() {
        var seq;
        seq = new flow.Sequence();
        return expectProperSequenceState(seq, -1, 0);
      });
      it("initializes with supplied state correcly", function() {
        var seq;
        seq = new flow.Sequence(test_flow);
        return expectProperSequenceState(seq, 0, 4, test_flow.steps[0]);
      });
      it("correctly determines whether it has a next step in the sequence", function() {
        var seq;
        seq = new flow.Sequence();
        expect(seq.has_next()).toEqual(false);
        seq = new flow.Sequence(test_flow);
        expect(seq.has_next()).toEqual(true);
        seq = new flow.Sequence({
          steps: [
            {
              type: "Step",
              view: "/template1.txt"
            }
          ]
        });
        return expect(seq.has_next()).toEqual(false);
      });
      it("correctly moves to the next step in the sequence, not allowing 			the sequence to proceed past the last step", function() {
        var seq;
        seq = new flow.Sequence();
        seq.next();
        expectProperSequenceState(seq, -1, 0);
        seq = new flow.Sequence(test_flow);
        expectProperSequenceState(seq, 0, 4, test_flow.steps[0]);
        seq.next();
        expectProperSequenceState(seq, 1, 4, test_flow.steps[1]);
        seq.next();
        expectProperSequenceState(seq, 2, 4, test_flow.steps[2]);
        seq.next();
        expectProperSequenceState(seq, 3, 4, test_flow.steps[3]);
        seq.next();
        return expectProperSequenceState(seq, 3, 4, test_flow.steps[3]);
      });
      it("correctly determines whether it has a previous step in the sequence", function() {
        var seq;
        seq = new flow.Sequence();
        expect(seq.has_previous()).toEqual(false);
        seq = new flow.Sequence(test_flow);
        expect(seq.has_previous()).toEqual(false);
        seq.next();
        return expect(seq.has_previous()).toEqual(true);
      });
      it("correctly moves to the previous step in the sequence, not allowing 			the sequence to move before the first step", function() {
        var seq;
        seq = new flow.Sequence();
        expectProperSequenceState(seq, -1, 0);
        seq.previous();
        expectProperSequenceState(seq, -1, 0);
        seq = new flow.Sequence(test_flow);
        while (seq.has_next()) {
          seq.next();
        }
        expectProperSequenceState(seq, 3, 4, test_flow.steps[3]);
        seq.previous();
        expectProperSequenceState(seq, 2, 4, test_flow.steps[2]);
        seq.previous();
        expectProperSequenceState(seq, 1, 4, test_flow.steps[1]);
        seq.previous();
        expectProperSequenceState(seq, 0, 4, test_flow.steps[0]);
        seq.previous();
        return expectProperSequenceState(seq, 0, 4, test_flow.steps[0]);
      });
      it("correctly allows the addition of new steps", function() {
        var seq, step;
        seq = new flow.Sequence();
        expectProperSequenceState(seq, -1, 0);
        step = {
          type: "Step",
          view: "/template1.txt"
        };
        seq.append(step);
        expectProperSequenceState(seq, 0, 1, step);
        seq.append(step);
        return expectProperSequenceState(seq, 0, 2, step);
      });
      it("correctly allows the addition of multiple steps", function() {
        var seq;
        seq = new flow.Sequence();
        expectProperSequenceState(seq, -1, 0);
        seq.append_all(test_flow.steps);
        return expectProperSequenceState(seq, 0, 4, test_flow.steps[0]);
      });
      it("returns a the correct step at any given position in the sequence", function() {
        var seq;
        seq = new flow.Sequence();
        expect(seq.get(1)).toBeNull();
        seq = new flow.Sequence(test_flow);
        expect(seq.get(0)).toEqual(test_flow.steps[0]);
        expect(seq.get(1)).toEqual(test_flow.steps[1]);
        expect(seq.get(2)).toEqual(test_flow.steps[2]);
        return expect(seq.get(3)).toEqual(test_flow.steps[3]);
      });
      return it("returns the correct length if nested sequences are included as steps", function() {
        var complex_flow, seq, step, sub_seq1, sub_seq2;
        sub_seq1 = new flow.Sequence(test_flow);
        sub_seq2 = new flow.Sequence(test_flow);
        step = new flow.Step();
        complex_flow = {
          id: "Complex Flow",
          steps: [sub_seq1, sub_seq2, step]
        };
        seq = new flow.Sequence(complex_flow);
        return expectProperSequenceState(seq, 0, 9, sub_seq1);
      });
    });
    return describe("flow.Flow", function() {
      var expectProperPosition;
      expectProperPosition = function(flow, length, position, stepValue) {
        expect(flow.length()).toEqual(length);
        expect(flow.current.position).toEqual(position);
        if (stepValue != null) {
          return expect(flow.current.step).toEqual(stepValue);
        } else {
          expect(flow.current.step).toBeNull();
          return expect(flow.current.step).toBeDefined();
        }
      };
      it("initializes defaults correctly, setting the current position 			and node length to zero", function() {
        var flow1;
        flow1 = new flow.Flow();
        return expectProperPosition(flow1, 0, -1);
      });
      it("initializes from a supplied sequence, setting the current position 			to 1, and length to the number of steps", function() {
        var flow1;
        flow1 = new flow.Flow(test_flow);
        return expectProperPosition(flow1, 4, 0, test_flow.steps[0]);
      });
      return it("moves to next and previous nodes, setting the current position to the correct value, 			does not allow the sequence to move past the final node or before the first node", function() {
        var flow1;
        flow1 = new flow.Flow(test_flow);
        expectProperPosition(flow1, 4, 0, test_flow.steps[0]);
        flow1.forward();
        expectProperPosition(flow1, 4, 1, test_flow.steps[1]);
        flow1.forward();
        expectProperPosition(flow1, 4, 2, test_flow.steps[2]);
        flow1.forward();
        expectProperPosition(flow1, 4, 3, test_flow.steps[3]);
        flow1.forward();
        expectProperPosition(flow1, 4, 3, test_flow.steps[3]);
        flow1.back();
        expectProperPosition(flow1, 4, 2, test_flow.steps[2]);
        flow1.back();
        expectProperPosition(flow1, 4, 1, test_flow.steps[1]);
        flow1.back();
        expectProperPosition(flow1, 4, 0, test_flow.steps[0]);
        flow1.back();
        return expectProperPosition(flow1, 4, 0, test_flow.steps[0]);
      });
    });
  });

}).call(this);
