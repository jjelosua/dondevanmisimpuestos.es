require 'sinatra/base'
require 'erb'

class WhereDoMyTaxesGoApp < Sinatra::Base

  # Enable serving of static files
  set :static, true
  set :public, 'public'
  
  get '/' do
    erb :index
  end
  
  get '/ayuda/' do
    erb :help
  end
    
  get '/sobre-nosotros/' do
    erb :about_us
  end

  get '/legal/' do
    erb :legal
  end  
end
