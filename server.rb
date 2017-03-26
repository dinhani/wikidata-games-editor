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
    conn.login("username", "password")
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

    # do edit
    data = '{"claims":[{"mainsnak":{"snaktype":"value","property":"PROPERTY_TYPE","datavalue":{"value":{"numeric-id":"PROPERTY_VALUE","entity-type":"item"},"type":"wikibase-entityid"}},"type":"statement","rank":"normal"}]}'
    data = data.gsub("PROPERTY_TYPE", json['propertyType'])
    data = data.gsub("PROPERTY_VALUE", json['propertyValue'].gsub("Q", ""))

    # send request
    editor = WbEditEntityAction.new(conn, "http://www.wikidata.org/entity/")
    editor.wbEditEntity(json["entity"], nil, nil, nil, data, false, false, 0, "")
end

