import geopy
import json

with open('csvjson.json', 'r') as openfile:
	json_object = json.load(openfile)

i=0
for x in json_object:
	geolocator = geopy.Nominatim(user_agent="check_1")
	r = geolocator.reverse((x['latitude'], x['longitude']))
	print(i,'/',len(json_object))
	try:
		pin = r.raw['address']['postcode']
		print( x['state'] , x['city'] , x['area'] , pin )
		json_object[i]['pincode'] = pin
	except:
		pass
	print()
	i=i+1
dictionary = json.dumps(json_object, indent=4)
with open("csvjson1.json", "w") as outfile:
	outfile.write(dictionary)