import pymongo
import json
import os
from bson.objectid import ObjectId


myclient = pymongo.MongoClient("mongodb://localhost:27017/")
dbn = "GIWW"
in_loc = 'in/'+dbn+'/'
colls = os.listdir(in_loc)


mydb = myclient[dbn]
for x in colls:
	coll_name = x.split('.')[0]
	
	with open(in_loc+x, 'r') as openfile:
		json_object = json.load(openfile)
	mycol = mydb[coll_name]
	tmp_lst = []
	for y in json_object:
		y['_id'] = ObjectId( str(y['_id']['$oid']) )
		tmp_lst.append(y)
	mycol.insert_many(tmp_lst)