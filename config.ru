RACK_ENV='development' if not defined?(RACK_ENV)

FileUtils.mkdir_p 'log' unless File.exists?('log')
log = File.new("log/sinatra.log", "a")
$stdout.reopen(log)
$stderr.reopen(log)

require 'rack/cache'
use Rack::Cache,
  :verbose     => true,
  :metastore   => 'file:tmp/cache/rack/meta',
  :entitystore => 'file:tmp/cache/rack/body'

gem 'sinatra', '1.0'
require 'app'
run WhereDoMyTaxesGoApp
