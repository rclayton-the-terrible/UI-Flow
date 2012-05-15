(function() {

  window.WorkflowEngine = (function() {

    function WorkflowEngine() {}

    return WorkflowEngine;

  })();

  window.Position = (function() {

    function Position(ctx) {
      _.extend(this, ctx);
    }

    return Position;

  })();

}).call(this);
