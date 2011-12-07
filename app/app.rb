require 'sinatra/base'
require 'erb'

require 'app/partials'

class WhereDoMyTaxesGoApp < Sinatra::Base

  # Enable serving of static files
  set :static, true
  set :public, 'public'

  helpers Sinatra::Partials
  
  get '/' do
    erb :index
  end
  
  get '/ccaa/' do
    erb :ccaa
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
