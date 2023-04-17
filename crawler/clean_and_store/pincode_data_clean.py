import pymongo
import json

myclient = pymongo.MongoClient('mongodb://localhost:27017/')
mydb = myclient['GIWW']
pincode_teb = mydb['pincodes']


file_name = "pincode_IN.json"

f = open(file_name)
data = json.load(f)

print()
full_ls = []
for state in data.keys():
	for city in data[state].keys():
		for area in data[state][city].keys():
			pincode = data[state][city][area]
			
			state1 = ''
			city1 = ''
			area1 = ''
			pincode1 = ''
			
			if state[-1] == " ":
				state1 = state[0:-1]
			else:
				state1 = state
			if city[-1] == " ":
				city1 = city[0:-1]
			else:
				city1 = city
			if area[-1] == " ":
				area1 = area[0:-1]
			else:
				area1 = area
			if pincode[-1] == " ":
				pincode1 = pincode[0:-1]
			else:
				pincode1 = pincode
			


			tmp_dict = {
				"pincode":pincode1,
				"area":area1,
				"city":city1,
				"state":state1,
				"flg":0
			}
			full_ls.append(tmp_dict)
			# pincode_teb.insert_one(tmp_dict)
	print()
	print()

json_object = json.dumps(full_ls, indent=4)
with open("pincode_proper.json", "w") as outfile:
	outfile.write(json_object)