if require?
	flow = require "./berico-ui-wf-flow.js"

buster?.spec.expose()

describe "Flow Test Package", ->
	
	describe "flow.Utils", ->
		
		it "normalizes a null handler to an empty array", ->
			
			expect(flow.Utils.normalize_handlers null).toEqual []
			
		it "normalizes a single handler to an array of handlers", ->
			
			handler = ()-> true
			
			expect(flow.Utils.normalize_handlers handler).toEqual [ handler ]

		it "turns an object into a single item array, or if the 
			object is an array, simply returns it", ->
			
			test_array = [ 1, 2, 3 ]	
			
			expect(flow.Utils.arrayify test_array).toEqual test_array
			
			expect(flow.Utils.arrayify 1).toEqual [ 1 ]
	
	test_context =
		id: "test_step"
		to: "next_item"
		from: "previous_item"
		view: "test_step_view"
	
	expectProperStepInitialization = (target, context) ->
		expect(target[property]).toEqual(value) for property, value of context
		null #idiotic fix
	
	ensureHandlerIsCalled = (handlerName, spy, initiator) ->
		
		handlers = {}
		handlers[handlerName] = spy
		
		step = new flow.Step(handlers)
		
		initiator step
		
		expect(spy).toHaveBeenCalled()
	
	describe "flow.Step", ->
		
		it "initializes correctly when provided a full context", ->
			
			step = new flow.Step(test_context)
			
			expectProperStepInitialization step, test_context
		
		it "initialized the id using an incremented id when unavailable", ->
			
			step = new flow.Step({})
			
			expect(step.id).toMatch /step_[0-9]+/
			
		it "sets the name of the node to the id of the node if the name was not provided", ->
			
			step = new flow.Step({ id: "1234" })
			
			expect(step.name).toEqual "1234"
			expect(step.name).toEqual step.id
	
		it "sets the 'to' and 'from' property to null if the properties where not provided", ->
			
			step = new flow.Step()
			
			expect(step.to).toBeDefined()
			expect(step.to).toBeNull()
			
			expect(step.from).toBeNull()
			expect(step.from).toBeDefined()
		
		it "should have the state set to 'never_seen' when initialized", ->
			
			step = new flow.Step()
			expect(step.state.weight).toEqual -2
			expect(step.state.name).toEqual "never_seen"
		
		it "should return a default no-op validation function when initialized", ->
			
			step = new flow.Step()
			expect(step.validate()).toEqual true
		
		it "should default to a synchronous step if no async=true 
			value is provided in the context", ->
				
			step = new flow.Step()
			expect(step.async).toEqual false
			
		it "should become an asynchronous step if async=true is specified 
			in the context", ->
			
			step = new flow.Step({ async: true })
			expect(step.async).toEqual true

		it "defines a set of empty event handlers if none are provided", ->
			
			step = new flow.Step()
			expect(step.on_loading).toEqual []
			expect(step.on_load).toEqual []
			expect(step.on_validating).toEqual []
			expect(step.on_validated).toEqual []
			expect(step.on_not_validated).toEqual []
			expect(step.on_leaving).toEqual []
			expect(step.on_leave).toEqual []

		it "properly sets a handler when supplied via context", ->
			
			handlers =
				on_loading: ()-> true
				on_load: ()-> true
				on_validating: ()-> true
				on_validated: ()-> true
				on_not_validated: ()-> true
				on_leaving: ()-> true
				on_leave: ()-> true
			
			step = new flow.Step(handlers)
			
			expect(step.on_loading).toEqual [ handlers.on_loading ]
			expect(step.on_load).toEqual [ handlers.on_load ]
			expect(step.on_validating).toEqual [ handlers.on_validating ]
			expect(step.on_validated).toEqual [ handlers.on_validated ]
			expect(step.on_not_validated).toEqual [ handlers.on_not_validated ]
			expect(step.on_leaving).toEqual [ handlers.on_leaving ]
			expect(step.on_leave).toEqual [ handlers.on_leave ]
			
		it "calls the 'on_loading' handler when the Step is instructed to load", ->
			
			ensureHandlerIsCalled "on_loading", @spy(), (step) -> step.load()
		
		it "calls the 'on_load' handler when the Step had been loaded", ->
			
			ensureHandlerIsCalled "on_load", @spy(), (step) -> step.load()
		
		it "calls the 'on_validating' handler when the Step had been asked to validate", ->
			
			ensureHandlerIsCalled "on_validating", @spy(), (step) -> step.is_valid()
		
		it "calls the 'on_validated' handler when the Step had been validated", ->
			
			ensureHandlerIsCalled "on_validated", @spy(), (step) -> step.is_valid()
		
		it "calls the 'on_not_validated' handler when the Step had failed to validate", ->

			on_not_validated_handler = @spy()
			on_validating_handler = @spy()
			on_validated_handler = @spy()
			
			context = 
				on_not_validated: on_not_validated_handler
				on_validated: on_validated_handler
				on_validating: on_validating_handler
				# Have to override the default validation function
				validate: ()-> false 
			
			step = new flow.Step(context)
			
			step.is_valid()
			
			expect(on_validating_handler).toHaveBeenCalled()
			expect(on_not_validated_handler).toHaveBeenCalled()
			refute.called(on_validated_handler)
		
		it "calls event handlers in the correct sequence", ->
			
			handlers =
				on_loading: @spy()
				on_load: @spy()
				on_validating: @spy()
				on_validated: @spy()
				on_not_validated: @spy()
				on_leaving: @spy()
				on_leave: @spy()
			
			step = new flow.Step(handlers)
			
			step.load()
			
			assert.callOrder(handlers.on_loading, handlers.on_load)
			
			step.is_valid()
			
			assert.callOrder(handlers.on_validating, handlers.on_validated)
			
			step.unload()
			
			assert.callOrder(handlers.on_leaving, handlers.on_leave)

	describe "flow.ResourceStep", ->
		
		it "initializes resources using the parent constructor", ->
			
			rstep = new flow.ResourceStep(test_context)
			expectProperStepInitialization rstep, test_context
		
		it "should initialize the resource object with 'null' path and context values when not specified", ->
			
			rstep = new flow.ResourceStep()
			
			expect(rstep.resource).toBeDefined()
			
			expect(rstep.resource.path).toBeDefined()
			expect(rstep.resource.path).toBeNull()
			
			expect(rstep.resource.context).toBeDefined()
			expect(rstep.resource.context).toBeNull()
	
	
	
	test_flow = 
		id: "test_flow"
		steps: [
			{ type: "Step", view: "/template1.txt" },
			{ type: "Step", view: "/template2.txt" },
			{ type: "Step", view: "/template3.txt" },
			{ type: "Step", view: "/template4.txt" },
		]		

					
	describe "flow.Sequence", ->
		
		expectProperSequenceState = (seq, current_position, length, current_step) ->
			expect(seq.current_position).toEqual current_position
			expect(seq.length()).toEqual length
			if current_step?
				expect(seq.current).toEqual current_step
			else
				expect(seq.current).toBeDefined()
				expect(seq.current).toBeNull()
		
		it "properly initializes with no provided state", ->
			
			seq = new flow.Sequence()
			
			expectProperSequenceState(seq, -1, 0)
		
		it "initializes with supplied state correcly", ->
			
			seq = new flow.Sequence(test_flow)
			
			expectProperSequenceState(seq, 0, 4, test_flow.steps[0])
		
		it "correctly determines whether it has a next step in the sequence", ->
			
			# There's no steps, so this should be false
			seq = new flow.Sequence()
			
			expect(seq.has_next()).toEqual false
			
			# There's four steps in the test flow, so there should be a next value
			seq = new flow.Sequence(test_flow)
			
			expect(seq.has_next()).toEqual true
			
			# There's only on step in this sequence, so there should not be a next value
			seq = new flow.Sequence({ steps: [ { type: "Step", view: "/template1.txt" } ] })
			
			expect(seq.has_next()).toEqual false
			
		it "correctly moves to the next step in the sequence, not allowing 
			the sequence to proceed past the last step", ->
						
			seq = new flow.Sequence()
			
			seq.next()
			
			expectProperSequenceState(seq, -1, 0)			
			
			seq = new flow.Sequence(test_flow)
			
			expectProperSequenceState(seq, 0, 4, test_flow.steps[0])
			
			seq.next()
			
			expectProperSequenceState(seq, 1, 4, test_flow.steps[1])
			
			seq.next()
			
			expectProperSequenceState(seq, 2, 4, test_flow.steps[2])
			
			seq.next()
			
			expectProperSequenceState(seq, 3, 4, test_flow.steps[3])
			
			# Attempt to push past the last node
			seq.next()
			
			expectProperSequenceState(seq, 3, 4, test_flow.steps[3])
			
		it "correctly determines whether it has a previous step in the sequence", ->
			
			# There's no steps, so this should be false
			seq = new flow.Sequence()
			
			expect(seq.has_previous()).toEqual false
			
			seq = new flow.Sequence(test_flow)
			
			# We are on the first node, so this should be false
			expect(seq.has_previous()).toEqual false
			
			# Move to the second step
			seq.next()
			
			expect(seq.has_previous()).toEqual true
		
		it "correctly moves to the previous step in the sequence, not allowing 
			the sequence to move before the first step", ->
			
			# Ensure that a no step sequence doesn't allow previous() to do
			# something unnatural
			seq = new flow.Sequence()
			
			expectProperSequenceState(seq, -1, 0)
			
			seq.previous()
			
			expectProperSequenceState(seq, -1, 0)
			
			seq = new flow.Sequence(test_flow)
			
			# Move the cursor to the end of the sequence
			seq.next() while seq.has_next()
			
			# Let's make sure we are at the end of the sequence
			expectProperSequenceState(seq, 3, 4, test_flow.steps[3])
			
			seq.previous()
			
			expectProperSequenceState(seq, 2, 4, test_flow.steps[2])
			
			seq.previous()
			
			expectProperSequenceState(seq, 1, 4, test_flow.steps[1])
			
			seq.previous()
			
			expectProperSequenceState(seq, 0, 4, test_flow.steps[0])
			
			# Attempt to push before the first step
			seq.previous()
			
			expectProperSequenceState(seq, 0, 4, test_flow.steps[0])
		
		it "correctly allows the addition of new steps", ->
			
			seq = new flow.Sequence()
			
			expectProperSequenceState(seq, -1, 0)
			
			step =
				type: "Step"
				view: "/template1.txt"
			
			seq.append step
			
			expectProperSequenceState(seq, 0, 1, step)
			
			seq.append step
			
			expectProperSequenceState(seq, 0, 2, step)
			
		it "correctly allows the addition of multiple steps", ->
			
			seq = new flow.Sequence()
			
			expectProperSequenceState(seq, -1, 0)
			
			seq.append_all test_flow.steps
			
			expectProperSequenceState(seq, 0, 4, test_flow.steps[0])
			
		it "returns a the correct step at any given position in the sequence", ->
			
			seq = new flow.Sequence()
			
			expect(seq.get(1)).toBeNull()
			
			seq = new flow.Sequence(test_flow)
			
			expect(seq.get(0)).toEqual test_flow.steps[0]
			expect(seq.get(1)).toEqual test_flow.steps[1]
			expect(seq.get(2)).toEqual test_flow.steps[2]
			expect(seq.get(3)).toEqual test_flow.steps[3]
		
		it "returns the correct length if nested sequences are included as steps", ->
			
			sub_seq1 = new flow.Sequence(test_flow)
			sub_seq2 = new flow.Sequence(test_flow)
			
			step = new flow.Step()
			
			complex_flow = 
				id: "Complex Flow"
				steps: [
					sub_seq1,
					sub_seq2,
					step
				]
			
			seq = new flow.Sequence(complex_flow)
			
			expectProperSequenceState(seq, 0, 9, sub_seq1)
		
	
	
	describe "flow.Flow", ->
		
		expectProperPosition = (flow, length, position, stepValue) ->
			expect(flow.length()).toEqual length
			expect(flow.current.position).toEqual position
			if stepValue? 
				expect(flow.current.step).toEqual stepValue 
			else
				expect(flow.current.step).toBeNull()
				expect(flow.current.step).toBeDefined()
				
		it "initializes defaults correctly, setting the current position 
			and node length to zero", ->
			
			flow1 = new flow.Flow()
			
			expectProperPosition(flow1, 0, -1)

		it "initializes from a supplied sequence, setting the current position 
			to 1, and length to the number of steps", ->
			
			flow1 = new flow.Flow(test_flow)
			
			expectProperPosition(flow1, 4, 0, test_flow.steps[0])		
		
		it "moves to next and previous nodes, setting the current position to the correct value, 
			does not allow the sequence to move past the final node or before the first node", ->
			
			flow1 = new flow.Flow(test_flow)
			
			expectProperPosition(flow1, 4, 0, test_flow.steps[0])	
			
			flow1.forward()
			
			expectProperPosition(flow1, 4, 1, test_flow.steps[1])
	
			flow1.forward()
			
			expectProperPosition(flow1, 4, 2, test_flow.steps[2])
			
			flow1.forward()
			
			expectProperPosition(flow1, 4, 3, test_flow.steps[3])
			
			#Attempt to go beyond the last node
			flow1.forward()
			
			expectProperPosition(flow1, 4, 3, test_flow.steps[3])
			
			flow1.back()
			
			expectProperPosition(flow1, 4, 2, test_flow.steps[2])
			
			flow1.back()
			
			expectProperPosition(flow1, 4, 1, test_flow.steps[1])
			
			flow1.back()
			
			expectProperPosition(flow1, 4, 0, test_flow.steps[0])
			
			# Attempt to go further back than the first node
			flow1.back()
			
			expectProperPosition(flow1, 4, 0, test_flow.steps[0])
