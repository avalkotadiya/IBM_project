import pymongo
import json
import os

myclient = pymongo.MongoClient("mongodb://localhost:27017/")

dbn = "GIWW"

mydb = myclient[dbn]
op_loc1 = 'op/'
op_loc = op_loc1+dbn+'/'
os.system('mkdir "'+op_loc+'"')

print(mydb.list_collection_names())
for x in mydb.list_collection_names():
	mycol = mydb[x]

	dictionary = mycol.find()
	tmp_lst = []
	for y in dictionary:
		y['_id'] = {'$oid':str(y['_id'])}
		tmp_lst.append(y)

	json_object = json.dumps(tmp_lst, indent=4)
	with open(op_loc+x+".json", "w") as outfile:
		outfile.write(json_object)