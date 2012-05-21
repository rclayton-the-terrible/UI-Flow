
if require?
	_ = (require "./underscore.js")._

###
	The simplest Node in the Finite State Machine "flow" model.
###
class Step
	
	@@global_step_id = 0
	
	constructor: (prototype) ->
		_.extend(@ ? {}, prototype)
		@id = @id ? "step_#{++@@global_step_id}"
		@name = @name ? @id
		@to = @to ? null
		@from = @from ? null
		
###
	Defines a step that manipulates a specific resource
###
class ResourceStep extends Step
	
	constructor: (prototype) ->
		super(prototype)
		@resource = @resource ? { }
		@resource.path = @resource.path ? null
		@resource.context = @resource.context ? null
		
		
		
		
		
		
if exports? then flow = exports else flow = window	

flow.Step = Step
flow.ResourceStep = ResourceStep
