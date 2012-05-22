
if require?
	_ = (require "./underscore.js")._

###
	The simplest Node in the Finite State Machine "flow" model.
###
class Step
	
	@global_step_id = 0
	
	@states = [ 
		{ name: "never_seen", weight: -2 },
		{ name: "preload", weight: -1 }, 
		{ name: "loaded", weight: 0 },
		{ name: "validated", weight: 1 },
		{ name: "pretrans", weight: 2 }, 
		{ name: "posttrans", weight: 3 } 
	]

	constructor: (prototype) ->
		_.extend(@ ? {}, prototype)
		@id = @id ? "step_#{++Step.global_step_id}"
		@name = @name ? @id
		@async = @async ? false
		@to = @to ? null
		@from = @from ? null
		@state = @state ? Step.get_state_by_name "never_seen"
		@validate = @validate ? () -> true
		
	@get_state_by_name: (name) ->
		for state in Step.states
			return state if state.name = name
		return null

	@get_state_by_weight: (weight) ->
		for state in Step.states
			return state if state.weight = weight
		return null
	
###
	Defines a step that manipulates a specific resource
###
class ResourceStep extends Step
	
	constructor: (prototype) ->
		super(prototype)
		@resource = @resource ? { }
		@resource.path = @resource.path ? null
		@resource.context = @resource.context ? null
		
###
	Defines a collection of Steps that are executed in Sequence
###
class Sequence extends Step
	
	constructor: (prototype) ->
		super(prototype)
		@current_position = -1
		@length = 0
		@steps = @steps ? []
		@rectify()
	
	rectify: () ->
		if @current_position is -1 and @steps.length > 0
			@current_position = 0
			
		if 0 <= @current_position < @steps.length
			@current = @steps[@current_position]
		else	
			@current = null	
		
		@length = @steps.length
		
	has_next: () ->
		(@current_position + 1) < @steps.length
	
	next: () ->
		if @has_next()
			@current_position++
			@rectify()
	
	has_previous: () ->
		@current_position - 1 >= 0
	
	previous: () ->
		if @has_previous()
			@current_position--
			@rectify()
	
	append_all: (steps) ->
		@append(step, false) for step in steps
		@rectify()
	
	append: (step, do_rectify = true) ->
		@steps.push step
		if do_rectify then @rectify()
		
###
	Defines the root container of Steps and the basic object developers
	will interact with when commanding the UI Flow.
###
class Flow
	
	constructor: (initial_state) ->
		initial_state = initial_state ? {}
		@id = initial_state.id ? "adhoc"
		@current = { position: -1, step: null }
		@sequence = new Sequence()
		@sequence.append_all initial_state.steps if initial_state.steps?
		@update()
		
	update: (step_array) ->
		@current.position = @sequence.current_position
		@current.step = @sequence.current
			
	forward: ()->
		@sequence.next()
		@update()
	
	back: ()->
		@sequence.previous()
		@update()
	
if exports? then flow = exports else flow = window	

flow.Step = Step
flow.ResourceStep = ResourceStep
flow.Sequence = Sequence
flow.Flow = Flow
