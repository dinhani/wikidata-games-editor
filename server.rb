require 'jbundler'
require 'sinatra'
require 'sinatra/reloader'
require 'json'

java_import 'org.wikidata.wdtk.wikibaseapi.ApiConnection'
java_import 'org.wikidata.wdtk.wikibaseapi.WbEditEntityAction';

# ==============================================================================
# HELPERS
# ==============================================================================
def login
    conn = ApiConnection.new("https://www.wikidata.org/w/api.php")
    conn.login("username", "password"
    return conn
end
conn = login()

# ==============================================================================
# API
# ==============================================================================
get '/' do
    send_file File.join(settings.public_folder, 'index.html')
end

post '/add-relationship' do
    # parse request
    json = JSON.parse(request.body.read)
    puts json

    # parse json
    entity_id = json["entity"]['id']
    property_type = json['property']['type']
    property_id = json['property']['id'].gsub("Q", "")

    # log
    puts "Saving #{entity_id} | #{property_type}=#{property_id}"


    # do edit
    data = '{"claims":[{"mainsnak":{"snaktype":"value","property":"PROPERTY_TYPE","datavalue":{"value":{"numeric-id":"PROPERTY_ID","entity-type":"item"},"type":"wikibase-entityid"}},"type":"statement","rank":"normal"}]}'
    data = data.gsub("PROPERTY_TYPE", property_type)
    data = data.gsub("PROPERTY_ID", property_id)

    # send request
    editor = WbEditEntityAction.new(conn, "http://www.wikidata.org/entity/")
    editor.wbEditEntity(entity_id, nil, nil, nil, data, false, false, 0, "")
end

