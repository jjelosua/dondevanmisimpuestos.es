RACK_ENV='development' if not defined?(RACK_ENV)

require 'rubygems'
require 'bundler'

Bundler.require(:default, RACK_ENV)

require 'rack/cache'
use Rack::Cache,
  :verbose     => true,
  :metastore   => 'file:tmp/cache/rack/meta',
  :entitystore => 'file:tmp/cache/rack/body'

require 'sinatra'
require 'app'
run WhereDoMyTaxesGoApp
