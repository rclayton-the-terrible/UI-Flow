if require?
	flow = require "./berico-ui-wf-flow.js"

buster?.spec.expose()

describe "Flow Nodes", ->
	
	test_context =
		id: "test_step"
		to: "next_item"
		from: "previous_item"
		view: "test_step_view"
	
	expectProperStepInitialization = (target, context) ->
		expect(target[property]).toEqual(value) for property, value of context
		null #idiotic fix
			
	describe "flow.Step", ->
		
		it "initializes correctly when provided a full context", ->
			
			step = new flow.Step test_context
			
			expect(step.id).toEqual "test_step"
			expect(step.to).toEqual "next_item"
			expect(step.from).toEqual "previous_item"
			expect(step.view).toEqual "test_step_view"
		
		it "initialized the id using an incremented id when unavailable", ->
			
			step = new flow.Step {}
			
			expect(step.id).toMatch /step_[0-9]+/
			
		it "sets the name of the node to the id of the node if the name was not provided", ->
			
			step = new flow.Step { id: "1234" }
			
			expect(step.name).toEqual "1234"
			expect(step.name).toEqual step.id
	
		it "sets the 'to' and 'from' property to null if the properties where not provided", ->
			
			step = new flow.Step()
			
			expect(step.to).toBeNull()
			expect(step.from).toBeNull()
		
	describe "flow.ResourceStep", ->
		
		it "initializes resources using the parent constructor", ->
			
			rstep = new flow.ResourceStep test_context
			expectProperStepInitialization rstep, test_context
		
	
	