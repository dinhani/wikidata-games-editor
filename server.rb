require 'jbundler'
require 'sinatra'
require 'json'

java_import 'org.wikidata.wdtk.wikibaseapi.ApiConnection'
java_import 'org.wikidata.wdtk.wikibaseapi.WbEditEntityAction';


# ==============================================================================
# CONFIGURATION
# ==============================================================================
# environment
hostname = `hostname`.downcase
set :environment, :production unless hostname.include? "renato" or hostname.include? "desktop"

# reloader
require 'sinatra/reloader' if development?

# session
use Rack::Session::Pool, :expire_after => 60 * 30 # 30 minutes

# ==============================================================================
# CHECKS
# ==============================================================================
def check_logged
    if not is_logged
        halt(403, 'You must login first')
    end
end

def is_logged
    not session[:conn].nil?
end

# ==============================================================================
# API
# ==============================================================================
get '/' do
    send_file File.join(settings.public_folder, 'index.html')
end

post '/login' do
    # parse app request
    json = JSON.parse(request.body.read)
    username = json['username']
    password = json['password']

    # do login
    conn = ApiConnection.new("https://www.wikidata.org/w/api.php")
    conn.login(username, password)

    # store connection
    session[:conn] = conn
end

get '/login' do
    json = {:logged_in => false}
    if is_logged
        json[:logged_in] = session[:conn].loggedIn
        json[:username] = session[:conn].current_user
    end
    return json.to_json
end

post '/logout' do
    if is_logged
        session[:conn].logout()
    end
    session.clear
end

post '/add-relationship' do
    # check access
    check_logged()

    # parse app request
    json = JSON.parse(request.body.read)
    entity_id = json['entity']['id']
    property_type = json['property']['type']
    property_id = json['property']['id'].gsub('Q', '')

    # log
    puts "Saving #{entity_id} | #{property_type}=#{property_id}"

    # prepare Wikidata request
    data = '{"claims":[{"mainsnak":{"snaktype":"value","property":"PROPERTY_TYPE","datavalue":{"value":{"numeric-id":"PROPERTY_ID","entity-type":"item"},"type":"wikibase-entityid"}},"type":"statement","rank":"normal"}]}'
    data = data.gsub("PROPERTY_TYPE", property_type)
    data = data.gsub("PROPERTY_ID", property_id)

    # do Wikidata request
    editor = WbEditEntityAction.new(session[:conn], "http://www.wikidata.org/entity/")
    editor.wbEditEntity(entity_id, nil, nil, nil, data, false, false, 0, "")
end
