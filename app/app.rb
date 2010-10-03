require "rubygems"
require "bundler/setup"

require 'sinatra/base'
require 'haml'

require 'app/model'

class StateBudgetApp < Sinatra::Base
  get '/' do
    @sections = Expense.all(:entity_id => '')
    haml :index
  end
  
  get '/section/:section' do
    @section = Expense.all(:section => params[:section], :entity_id => '').first
    @entities = Expense.all(:section => params[:section], :entity_id.not => '', :programme => '')
    haml :section
  end
  
  # TODO: Move all this logic to model
  get '/section/:section/entity/:entity' do
    @section = Expense.all(:section => params[:section], :entity_id => '').first
    @entity = Expense.all(:section => params[:section], :entity_id => params[:entity], :programme => '').first
    @programmes = Expense.all(:section => params[:section], :entity_id => params[:entity], :programme.not => '', :concept => '')
    haml :entity
  end
  
  get '/section/:section/entity/:entity/programme/:programme' do
    @section = Expense.all(:section => params[:section], :entity_id => '').first
    @entity = Expense.all(:section => params[:section], :entity_id => params[:entity], :programme => '').first
    @programme = Expense.all(:section => params[:section], :entity_id => params[:entity], :programme => params[:programme], :concept => '').first
    @expenses = Expense.all(:section => params[:section], :entity_id => params[:entity], :programme => params[:programme], :concept.not => '')
    haml :programme
  end
end
