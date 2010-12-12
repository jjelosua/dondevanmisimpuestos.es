RACK_ENV='development' if not defined?(RACK_ENV)

require 'sinatra'
require 'app'
run WhereDoMyTaxesGoApp
