import requests
from bs4 import BeautifulSoup
import json
import pymongo
from bson.objectid import ObjectId

from geopy.exc import GeocoderTimedOut
from geopy.geocoders import Nominatim



 

with open('pin_ll.json', 'r') as openfile:
	pin_ll = json.load(openfile)

def find_(code):
	for x in pin_ll:
		# print(x)
		if str(x['postalcode']) == code:
			return [x['latitude'],x['longitude']]
	return None




myclient = pymongo.MongoClient('mongodb://localhost:27017/')
mydb = myclient['GIWW']
home_mas = mydb['pincodes']

tot_data = []
i=0
for x in home_mas.find({"flg":0}):
	tot_data.append(x)


for x in tot_data:
	place = x['area']+','+x['city']+','+x['state']
	
	loc = find_(x['pincode'])
	# print(loc)
	if loc != None:
		lat=loc[0]
		lon=loc[1]
		myquery = { "_id": ObjectId(x['_id']) }
		newvalues = { "$set": { "lat": lat , "lon" : lon , "flg":1 } }
		home_mas.update_one(myquery, newvalues)
		print(i,'/',len(tot_data),'\t(',x['pincode'],')')
	else:
		print(i,'/',len(tot_data),'\t(',x['pincode'],')\tErr')


	i=i+1
