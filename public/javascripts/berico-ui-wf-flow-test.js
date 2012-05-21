(function() {
  var flow;

  if (typeof require !== "undefined" && require !== null) {
    flow = require("./berico-ui-wf-flow.js");
  }

  if (typeof buster !== "undefined" && buster !== null) buster.spec.expose();

  describe("Flow Nodes", function() {
    var expectProperStepInitialization, test_context;
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
    describe("flow.Step", function() {
      it("initializes correctly when provided a full context", function() {
        var step;
        step = new flow.Step(test_context);
        expect(step.id).toEqual("test_step");
        expect(step.to).toEqual("next_item");
        expect(step.from).toEqual("previous_item");
        return expect(step.view).toEqual("test_step_view");
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
      return it("sets the 'to' and 'from' property to null if the properties where not provided", function() {
        var step;
        step = new flow.Step();
        expect(step.to).toBeNull();
        return expect(step.from).toBeNull();
      });
    });
    return describe("flow.ResourceStep", function() {
      return it("initializes resources using the parent constructor", function() {
        var rstep;
        rstep = new flow.ResourceStep(test_context);
        return expectProperStepInitialization(rstep, test_context);
      });
    });
  });

}).call(this);
