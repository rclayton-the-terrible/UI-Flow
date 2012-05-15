$ ->
	
	context =
		initial: "n1"
		events: [
			new Position({ name: "gon1", to: "n2" }),
			new Position({ name: "gon2", from: "n2", to: "n3" }),
			new Position({ name: "gon3", from: "n3", to: "n4" }),
			new Position({ name: "gon4", from: "n4")
		]
		callbacks: {
			onchangestate: (event, from, to, msg)-> alert(event + ', ' + from + ', ' + to + ', ' + msg)
		}
	
	window.fsm = StateMachine.create context
	
	fsm.gon1()
	
	