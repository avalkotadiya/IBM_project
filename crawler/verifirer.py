from pyzbar import pyzbar
import webbrowser
import cv2
import json
import xmltodict
import pymongo
from datetime import date,datetime
import time
import smtplib
from email.message import EmailMessage
import os




# --------------- Functions --------------------
def send_mail(recv,sys_msg,sub):
	email_address = "maharsh2017@gmail.com"
	email_password = "iygvjccncdytkvlt"
	
	# create email
	msg = EmailMessage()
	msg['Subject'] = sub
	msg['From'] = email_address
	msg['To'] = recv
	msg.set_content(sys_msg)
	
	# send email
	with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
	    smtp.login(email_address, email_password)
	    smtp.send_message(msg)
# --------------- Functions --------------------




myclient = pymongo.MongoClient("mongodb://localhost:27017/")
mydb = myclient["GIWW"]
mycol = mydb["user_master"]


while True:
	todays_date = date.today()
	curr_year = todays_date.year


	all_data_user = mycol.find()
	all_auid = []
	for x in all_data_user:
		try:
			all_auid.append(x['adhar'][0]['@uid'])
		except:
			pass

	no_veri_data = mycol.find({'verified':"0"},{})
	for pep in no_veri_data:
		if pep['verified'] == 3:
			break
		now = datetime.now()
		print(now.strftime("%H:%M:%S"))
		try:
			image = cv2.imread( "../New website/static/pdf/"+pep['adhar_photo'] )
			gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
			barcodes = pyzbar.decode(gray)
			
			barcodeData=''
			for barcode in barcodes:
				barcodeData = barcode.data.decode("utf-8")
				barcodeType = barcode.type
			
			xml_json = xmltodict.parse(barcodeData)

			if xml_json['PrintLetterBarcodeData']['@uid'] not in all_auid:
				if xml_json['PrintLetterBarcodeData']['@gender'] == 'M':
					if int(curr_year)-int(xml_json['PrintLetterBarcodeData']['@yob']) > 17:
						mycol.update_one({ "mail": pep['mail'] }, { "$set": {"verified": "1"} })
						mycol.update_one({"mail": pep['mail']}, {'$push': {'adhar': xml_json['PrintLetterBarcodeData']}})
						send_mail(pep['mail'],"Your Account is Verified. Thank you for sign-up","GIWW Homes - Successful sign-up")
			else:
				path_del = '../New website/static/pdf/'+pep['adhar_photo']
				os.remove(path_del)
				mycol.update_one({ "mail": pep['mail'] }, { "$set": {"verified": "3"} })
				send_link = "This Adhar card is already registered. Please change adhar card photo. Click below button to change adhar card photo. \n http://127.0.0.1:5000/redocument?id="+str(pep['_id'])
				send_mail(pep['mail'],send_link,"GIWW Homes - Same Aadhar Card")
		except:
			path_del = '../New website/static/pdf/'+pep['adhar_photo']
			os.remove(path_del)
			mycol.update_one({ "mail": pep['mail'] }, { "$set": {"verified": "2"} })
			link = "http://127.0.0.1:5000/redocument?id="+str(pep['_id'])
			send_mail(pep['mail'],"Something went wrong with Document. Please upload 'High Resolution Image' of Adhar card's QR code on below link. \n"+link,"GIWW Homes - Problem in Document")


	# time.sleep(5)