(function() {

  $(function() {
    var context;
    context = {
      initial: "n1",
      events: [
        new Position({
          name: "gon1",
          from: "n1",
          to: "n2"
        }), new Position({
          name: "gon2",
          from: "n2",
          to: "n3"
        }), new Position({
          name: "gon3",
          from: "n3",
          to: "n4"
        }), new Position({
          name: "gon4",
          from: "n4",
          to: "n4"
        })
      ],
      callbacks: {
        onchangestate: function(event, from, to, msg) {
          return alert(event + ', ' + from + ', ' + to + ', ' + msg);
        }
      }
    };
    window.fsm = StateMachine.create(context);
    return fsm.gon1();
  });

}).call(this);
