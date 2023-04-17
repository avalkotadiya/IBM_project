from flask import Flask, jsonify, request,redirect, Response, abort, current_app as app
import sys, random
import pymongo
from datetime import datetime



myclient = pymongo.MongoClient("mongodb://localhost:27017/")
webser_log = myclient['WebServer_LOGS']
ip_log = webser_log['ip_log']
ip_block_lst = webser_log['ip_block_list']




def main(LETTERS,myKey,myMessage,myMode):

	checkValidKey(myKey,LETTERS)

	if myMode == 'encrypt':
		translated = encryptMessage(myKey, myMessage,LETTERS)
	elif myMode == 'decrypt':
		translated = decryptMessage(myKey, myMessage,LETTERS)

	# fin_txt = ''
	# for x in range(len(myMessage)):
	# 	if myMessage[x].isupper():
	# 		fin_txt = fin_txt + translated[x].upper()
	# 	elif myMessage[x].islower():
	# 		fin_txt = fin_txt + translated[x].lower()

	# translated = fin_txt

	print('Using key %s' % (myKey))
	print('The %sed message is:' % (myMode))
	print(translated)

	return translated


def checkValidKey(key,LETTERS):
	keyList = list(key)
	lettersList = list(LETTERS)
	keyList.sort()
	lettersList.sort()
	if keyList != lettersList:
		sys.exit('There is an error in the key or symbol set.')


def encryptMessage(key, message,LETTERS):
	return translateMessage(key, message, 'encrypt', LETTERS)


def decryptMessage(key, message,LETTERS):
	return translateMessage(key, message, 'decrypt', LETTERS)


def translateMessage(key, message, mode,LETTERS):
	translated = ''
	charsA = LETTERS
	charsB = key
	if mode == 'decrypt':
		charsA, charsB = charsB, charsA

	for symbol in message:
		if symbol.upper() in charsA:
			symIndex = charsA.find(symbol.upper())
			if symbol.isupper():
				translated += charsB[symIndex].upper()
			else:
				translated += charsB[symIndex].lower()
		else:
			translated += symbol

	return translated


def getRandomKey():
	key = list(LETTERS)
	random.shuffle(key)
	return ''.join(key)






app = Flask(__name__)


@app.route("/encrypt")
def enc():
	gdata = request.args.get('str')
	print(gdata)
	LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	myKey = 'QWERTYUIOPASDFGHJKLZXCVBNM'
	myMode = 'encrypt'

	str_data = main(LETTERS,myKey,gdata,myMode)

	return jsonify({'str': str_data})

@app.route("/decrypt")
def dec():
	gdata = request.args.get('str')
	
	LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
	myKey = 'QWERTYUIOPASDFGHJKLZXCVBNM'
	myMode = 'decrypt'


	str_data = main(LETTERS,myKey,gdata,myMode)

	return jsonify({'str': str_data})










@app.before_request
def block_n_log_method():
	ip = request.environ.get('REMOTE_ADDR')
	json_eve_ip_log = {
		"ip":ip,
		"port":'5003',
		"date":datetime.now().strftime('%Y-%m-%d'),
		"time":datetime.now().strftime('%I:%M:%S|%p'),
		"chk_flg":0
	}
	ip_log.insert_one(json_eve_ip_log)

	all_ip_blc_lst = (ip_block_lst.find_one({},{"_id":0}))['block_ips']

	if ip in all_ip_blc_lst:
		abort(403)




app.run(debug = True, threaded=True, host='0.0.0.0', port=5003)