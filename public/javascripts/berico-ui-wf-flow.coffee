
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
		# Event Handlers
		@on_loading = Step.normalize_handlers @on_loading
		@on_load = Step.normalize_handlers @on_load
		@on_validating = Step.normalize_handlers @on_validating
		@on_validated = Step.normalize_handlers @on_validated
		@on_not_validated = Step.normalize_handlers @on_not_validated
		@on_leaving = Step.normalize_handlers @on_leaving
		@on_leave = Step.normalize_handlers @on_leave
		
	@get_state_by_name: (name) ->
		for state in Step.states
			return state if state.name = name
		return null

	@get_state_by_weight: (weight) ->
		for state in Step.states
			return state if state.weight = weight
		return null
	
	@normalize_handlers: (handlers)->
		if handlers? then return Step.arrayify handlers else return []
	
	@arrayify: (handlers)->
		if handlers.push?
			return handlers
		else
		    return [ handlers ]
	
	set_state: (name) ->
		state_ctx = @get_state_by_name name
		@state = state_ctx if state_ctx?
	
	length: ()-> 1
	
	is_valid: ()->
		Step.fire @on_validating
		validated = @validate()
		if validated
			@set_state("validated")
			Step.fire @on_validated
		else
			Step.fire @on_not_validated
	
	is_done: ()->
		return @is_valid()
	
	load: ()->
		@set_state("preload")
		Step.fire @on_loading
		@set_state("loaded")
		Step.fire @on_load
	
	unload: ()->
		@set_state("pretrans")
		@set_state("posttrans")
	
	@fire: (handlers, this_obj)->
		# This looks wierd (handler.apply), but what we are doing is supply the handler
		# with an object (this_obj) in which the closure for 'this' will apply.  We also
		# supply the same object as the first parameter.  You choose how you want to 
		# deal with the supplied object.
		handler.apply(this_obj, [ this_obj ]) for handler in handlers
	
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
		@steps = @steps ? []
		@rectify()
	
	rectify: () ->
		if @current_position is -1 and @steps.length > 0
			@current_position = 0
			
		if 0 <= @current_position < @steps.length
			@current = @steps[@current_position]
		else	
			@current = null	
		
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
	
	get: (position)->
		if @steps.length is 0
			return null
		else if 0 <= position < @steps.length
			return @steps[position]
		else
			return null
	
	append_all: (steps) ->
		@append(step, false) for step in steps
		@rectify()
	
	append: (step, do_rectify = true) ->
		@steps.push step
		if do_rectify then @rectify()
	
	length: ()->
		combined_length = 0
		for step in @steps
			if step.length?
				step_length = step.length()
			else
				step_length = 1
			combined_length += step_length
		return combined_length
		
###
	Defines the root container of Steps and the basic object developers
	will interact with when commanding the UI Flow.
###
class Flow
	
	constructor: (initial_state) ->
		initial_state = initial_state ? {}
		@id = initial_state.id ? "adhoc"
		@current = { position: -1, step: null }
		@root_seq = new Sequence()
		@root_seq.append_all initial_state.steps if initial_state.steps?
		@update()
		
	update: (step_array) ->
		@current.position = @root_seq.current_position
		@current.step = @root_seq.current
			
	forward: ()->
		@root_seq.next()
		@update()
	
	back: ()->
		@root_seq.previous()
		@update()
		
	length: ()->
		@root_seq.length()
	
if exports? then flow = exports else flow = window	

flow.Step = Step
flow.ResourceStep = ResourceStep
flow.Sequence = Sequence
flow.Flow = Flow
