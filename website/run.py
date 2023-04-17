from flask import Flask, render_template, request, redirect, url_for, session, jsonify, abort, current_app as app
import time
import pymongo
from bson import json_util
import json
from fileinput import filename
import random
import smtplib
from email.message import EmailMessage
from bson.objectid import ObjectId
from datetime import datetime, timedelta, date
import qrcode
import urllib.parse
import uuid



def get_days_between(start_date_str, end_date_str):
	start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
	end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
	days_between = (end_date - start_date).days
	return days_between

def all_Date_bt(sdate,edate):
	start_date = datetime.strptime(sdate, "%Y-%m-%d").date()
	end_date = datetime.strptime(edate, "%Y-%m-%d").date()
	
	delta = timedelta(days=1)
	current_date = start_date
	lst_ret = []
	while current_date <= end_date:
		lst_ret.append(current_date.strftime("%Y-%m-%d"))
		current_date += delta
	return lst_ret




file = open("db.txt", "r").read()
full_name_get_file = file.split('\n')
conn = full_name_get_file[0]
dbname = full_name_get_file[1]
coll_names = full_name_get_file[2:]


myclient = pymongo.MongoClient(conn)
mydb = myclient[dbname]
admin = mydb[coll_names[0]]
user = mydb[coll_names[1]]
adhar_data = mydb[coll_names[2]]
homes_master = mydb[coll_names[3]]
booking_master = mydb[coll_names[4]]
all_pincodes = mydb[coll_names[5]]
homes = mydb[coll_names[6]]
room_data_base = mydb[coll_names[7]]
wallet_data_base = mydb[coll_names[8]]
payment_hist_data_base = mydb[coll_names[9]]
transaction_ids_data_base = mydb[coll_names[10]]

webser_log = myclient['WebServer_LOGS']
ip_log = webser_log['ip_log']
ip_block_lst = webser_log['ip_block_list']




app = Flask(__name__)
app.secret_key = "T\xbf\x82ZdQ\x14\xc5rUb\x14\xcf*\x91P\x83\x92\x04\x0b\x81\x01\x18\xfc"
app.config['PROPAGATE_EXCEPTIONS'] = True







# --------------- Functions --------------------
def send_mial(recv,otp):
	email_address = "maharsh2017@gmail.com"
	email_password = "iygvjccncdytkvlt"
	
	# create email
	msg = EmailMessage()
	msg['Subject'] = "GIWW Homes OTP"
	msg['From'] = email_address
	msg['To'] = recv
	msg.set_content("Your OTP is " + otp )
	
	# send email
	with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
		smtp.login(email_address, email_password)
		smtp.send_message(msg)
# --------------- Functions --------------------












# --------------- Landing --------------------

@app.route("/")
def landing():
	return render_template("landing/index.html")

# --------------- Landing --------------------












# --------------- USER MAIN --------------------

@app.route("/users", methods=['GET', 'POST'])
def main():
	if not session.get("id"):
		return redirect("/login")
	else:
		if session.get("u_a") != 'u':
			return redirect("/login")
	data = user.find_one({'_id':ObjectId(session['id'])})
	pincode_num = data['adhar'][0]['@pc']
	tot_home = homes.find({ 'pincode': pincode_num })

	pin_data = all_pincodes.find_one({'pincode':pincode_num})
	pin_code_l_l = {"lat":pin_data['lat'],"lon":pin_data['lon']}
	main_lat = pin_data['lat']
	main_lon = pin_data['lon']

	if (request.method == 'POST'):
		pincode_num = request.form.get('pincode_text')
		tot_home = homes.find({ 'pincode': pincode_num })
		new_tot_home = []
		for x in tot_home:
			x['_id']=str(x['_id'])
			new_tot_home.append(x)

		tot_home=new_tot_home
		pin_data = all_pincodes.find_one({'pincode':pincode_num})
		if pin_data == None:
			pin_code_l_l = {"lat":main_lat,"lon":main_lon}
		else:
			pin_code_l_l = {"lat":pin_data['lat'],"lon":pin_data['lon']}

	return render_template("user/index.html", page_name = 'Home' , pincode = pincode_num , homes = tot_home , zoom_cor = pin_code_l_l )


@app.route("/view/homes", methods=['GET', 'POST'])
def view_homes():
	if not session.get("id"):
		return redirect("/login")
	else:
		if session.get("u_a") != 'u':
			return redirect("/login")

	h_id = request.args.get('id')
	home_details = homes.find_one({ '_id': ObjectId(h_id) })
	home_details['_id'] = str(home_details['_id'])
	print(home_details)

	rooms_of_home1 = room_data_base.find({'home_data_id':h_id})
	rooms_of_home = []
	for x in rooms_of_home1:
		rooms_of_home.append( { 'hotel_name':home_details['prop_name'], 'rid':x['_id'], 'rtype':x['room_type'], 'price':x['price'], 'likes':x['likes'], 'photo':x['photos'][0] } )
	print(rooms_of_home)
	return render_template('user/homes.html',page_name='View Homes',details = rooms_of_home,hname=home_details['prop_name'])



@app.route("/view/homes/room", methods=['GET', 'POST'])
def view_homes_room():
	if not session.get("id"):
		return redirect("/login")
	else:
		if session.get("u_a") != 'u':
			return redirect("/login")

	r_id = request.args.get('id')

	room_details = room_data_base.find_one( {'_id':ObjectId(r_id)} )
	room_details['_id'] = str(room_details['_id'])

	home_details = homes.find_one({ '_id': ObjectId(room_details['home_data_id']) })
	home_details['_id'] = str(home_details['_id'])

	fin_lst_show = {
		'r_id' : r_id,
		'h_id' : str(home_details['_id']),
		'prop_name' : home_details['prop_name'],
		'rtype': room_details['room_type'],
		'rating' : home_details['rating'],
		'likes' : room_details['likes'],
		'details' : home_details['details'],
		'address' : home_details['address'],
		'area' : home_details['area'],
		'city' : home_details['city'],
		'state' : home_details['state'],
		'pincode' : home_details['pincode'],
		'price' : room_details['price'],
		'photos' : room_details['photos']
	}

	return render_template('user/home_details.html',page_name='View Room',details = fin_lst_show)



@app.route("/view/homes/room/checkout", methods=['GET', 'POST'])
def checkout_homes_room():
	if not session.get("id"):
		return redirect("/login")
	else:
		if session.get("u_a") != 'u':
			return redirect("/login")

	r_id = request.args.get('id')
	wdata = wallet_data_base.find_one( { 'user_id':session.get('id') } )
	hdata1 = payment_hist_data_base.find( {'user_id':session.get('id')},{'_id':0} )
	hdata = []
	for x in hdata1:
		prc = 0
		if x['type'] == 'cr':
			prc = '+'+ str(x['amount'])
		elif x['type'] == 'dr':
			prc = '-'+ str(x['amount'])
		hdata.append( {'item':x['item'],'amt':prc} )

	room_data11 = room_data_base.find_one({'_id':ObjectId(r_id)},{'_id':0})

	all_Dates_bt = all_Date_bt(room_data11['s_Date'],room_data11['e_Date'])
	for x in room_data11['booked_Dates']:
		all_Dates_bt.remove(x)
	
	if (request.method  == 'POST'):
		r_id = request.args.get('id')

		sdate = request.form.get('sdate_n')
		edate = request.form.get('edata_n')
		req = request.form.get('order_comment')
		days = request.form.get('days_totot')
		tot_price = request.form.get('tot_price')

		room_data_ = room_data_base.find_one({'_id':ObjectId(r_id)},{'_id':0})
		home_data_ = homes.find_one({'_id':ObjectId(room_data_['home_data_id'])})


		days_bt_me = str(get_days_between(sdate, edate))
		price_me = str(int(days_bt_me) * int(room_data_['price']))

		print(price_me,"\t",tot_price)
		print(days_bt_me,"\t",days)

		if price_me != tot_price or days_bt_me != days:
			print('do not try to menipulate website')
		else:
			json_ins_Data_booking = {
				"u_id" : session.get('id'),
				"room_id" : r_id,
				"s_Date" : sdate,
				"e_Date" : edate,
				"note":req,
				"tot_days" : days_bt_me,
				"amount" : price_me,
				"curr_date_time" : datetime.now().strftime("%d/%m/%Y %H:%M:%S")
			}
			json_ins_Data_pay_hist = {
				"user_id":session.get('id'),
				"type":"dr",
				"date": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
				"item": "Booked "+room_data_['room_type']+" room of "+home_data_['prop_name']+" from:"+sdate+" to:"+edate,
				"amount": price_me
			}

			booking_master.insert_one(json_ins_Data_booking)
			payment_hist_data_base.insert_one(json_ins_Data_pay_hist)

			wall_u_Data = wallet_data_base.find_one({'user_id':session.get('id')})
			wall_bal = wall_u_Data['amount'] - int(price_me)
			wallet_data_base.update_one({ "user_id": session.get('id') } , { "$set": { "amount": wall_bal } })

			r_data = room_data_base.find_one( {'_id': ObjectId(r_id)})
			new_dates = []
			for x in r_data['booked_Dates']:
				new_dates.append(x)
			for x in all_Date_bt(sdate,edate):
				new_dates.append(x)
			room_data_base.update_one( {'_id': ObjectId(r_id)}, {'$set': {'booked_Dates': new_dates }} )

	return render_template('user/checkout.html',wdata=wdata, hdata=hdata,room_data=room_data11,id_send = r_id,all_dates = all_Dates_bt)





# -------- wallet ----------

@app.route("/user/wallet/qr", methods=['POST'])
def qr_gen():
	if (request.method  == 'POST'):
		transactiondata = {}

		price = request.form['myData']
		payee_address = '9428246636@upi'
		payee_name = 'Patel Shankarbhai Nathabhai'
		amount = int(price)
		currency = 'INR'
		note = 'purchase GGIW wallet credits'
		while True:
			reference_id = str( uuid.uuid4().int )[:12]
			match_id = transaction_ids_data_base.find_one({'tran_id':reference_id})
			if match_id == None:
				photo_name = reference_id + '.png'
				uri = f'upi://pay?pa={payee_address}&pn={urllib.parse.quote(payee_name)}&am={amount}&cu={currency}&tn={urllib.parse.quote(note)}&tr={reference_id}'
				transactiondata = {'user_id':str(session.get('id')),'photo':str(photo_name),'tran_id':str(reference_id),'upi_uri':str(uri),'amount':str(amount)}
				break
		transaction_ids_data_base.insert_one(transactiondata)
		transactiondata['_id'] = str(transactiondata['_id'])
		qr_code_data = qrcode.make(uri)
		with open("static/img/upi_qr/"+photo_name, 'wb') as f:
			qr_code_data.save(f)

		return jsonify(transactiondata)


@app.route("/user/wallet", methods=['GET', 'POST'])
def user_wallet():

	if not session.get("id"):
		return redirect("/login")
	else:
		if session.get("u_a") != 'u':
			return redirect("/login")

	wdata = wallet_data_base.find_one( { 'user_id':session.get('id') } )
	hdata1 = payment_hist_data_base.find( {'user_id':session.get('id')},{'_id':0} )
	hdata = []
	for x in hdata1:
		prc = 0
		if x['type'] == 'cr':
			prc = '+'+ str(x['amount'])
		elif x['type'] == 'dr':
			prc = '-'+ str(x['amount'])
		hdata.append( {'item':x['item'],'amt':prc} )
	print(hdata)


	if wdata == None:
		wdata = { 'amount':0,'user_id':session.get('id') }

	if (request.method  == 'POST'):
		ref_no = request.form.get('ref_no')
		price = int(request.form.get('price_data_'))*10000


		old_data_user = wallet_data_base.find_one( {'user_id':session.get('id')} )
		if old_data_user != None:
			new_amt = old_data_user['amount'] + int(price)
			# print(new_amt)
			myquery = { "user_id": session.get('id') }
			newvalues = { "$set": { "amount": new_amt } }
			wallet_data_base.update_one(myquery, newvalues)
		else:
			new_amt = int(price)
			wallet_data_base.insert_one({'user_id':session.get('id'),'amount':new_amt})
		hist_data = {
			"user_id":session.get('id'),
			"type":"cr",
			"date":"",
			"item":"Add to Wallet",
			"amount" : price
		}
		payment_hist_data_base.insert_one(hist_data)
		return redirect(url_for('user_wallet'))
	
	
	return render_template('user/wallet.html',wdata=wdata, hdata=hdata)

# -------- wallet ----------




# --------------- USER MAIN --------------------




















# --------------- Shelter-Home --------------------


@app.route("/Shelter-Home/signup", methods=['GET', 'POST'])
def shelter_signup():
	error_msg = ''

	if session.get("id"):
		if session.get("u_a") == 'a':
			return redirect("/admin")
		elif session.get("u_a") == 'u':
			return redirect(url_for('main'))
		elif session.get("u_a") == 'h':
			return redirect(url_for('sh_home'))

	if (request.method == 'POST'):
		oname = request.form.get('name')
		mail = request.form.get('mailid')
		phone = request.form.get('phone')
		passs = request.form.get('pass')
		repasss = request.form.get('repass')
		prop_name = request.form.get('Sh_name')
		gstin = request.form.get('gtsin')
		address = request.form.get('add')
		pincode = request.form.get('pincode')
		state = request.form.get('state')
		city = request.form.get('city')
		area = request.form.get('area')
		maplink = request.form.get('maplink')
		lati = request.form.get('lati')
		longi = request.form.get('long')
		details = request.form.get('details')
		rating = 0
		verified = 0
		photo = request.files['photo']
		file_name = '(' + prop_name + '_'+ mail +').' + ((photo.filename).split('.'))[-1]
		photo.save( 'static\\img\\upload\\homes\\main\\'+file_name )

		

		if passs == repasss:
			data = user.find_one({'mail':mail})
			adata = admin.find_one({'mail':mail})
			print(data)
			if data == None and adata == None:
				
				json_store = {
					"owner_name":oname,
					"mail":mail,
					"pass":passs,
					"owner_number":phone,
					"GSTIN":gstin,
					"prop_name":prop_name,
					"address":address,
					"map_link":maplink,
					"lati":lati,
					"longi":longi,
					"pincode":pincode,
					"state":state,
					"city":city,
					"area":area,
					"details":details,
					"photo":file_name,
					"rating":rating,
					"verified":verified
				}


				homes.insert_one(json_store)

				return redirect(url_for('login'))
			else:
				error_msg = 'Email is Already There'
		else:
			error_msg = 'Password and Re-Password not match'

	return render_template("shelterhome/sign-up.html", page_name='signup',emsg=error_msg)

@app.route("/Shelter-Home/check-pincode", methods=['GET', 'POST'])
def shelter_check_pin():
	if (request.method == 'POST'):
		pincode = request.form['pincode']
		pin_data = all_pincodes.find_one({'pincode':pincode},{'_id':0})
		send_data = {}
		if pin_data != None:
			send_data = pin_data
	return jsonify(send_data)






@app.route("/Shelter-Home", methods=['GET', 'POST'])
def sh_home():
	error_msg = ''
	if not session.get("id"):
		return redirect("/login")
	else:
		if session.get("u_a") != 'h':
			return redirect("/login")
	h_data = homes.find_one({'_id':ObjectId(session.get("id"))})
	h_data['_id'] = str(h_data['_id'])

	find_all_rooms = room_data_base.find({'home_data_id':h_data['_id']})

	tot_amount = 0
	each_room_tot = []
	for room in find_all_rooms:
		find_all_booking = booking_master.find({'room_id':str(room['_id'])})
		room_amt = 0
		for booking in find_all_booking:
			tot_amount += int(booking['amount'])
			room_amt += int(booking['amount'])

		each_room_tot.append({'room_nm':room['room_type'],'likes':room['likes'],'amt':room_amt,'rid':str(room['_id'])})


	return render_template("shelterhome/index.html", page_name='Shelter-Home',emsg=error_msg,h_data=h_data,tot_amt=tot_amount,each_room=each_room_tot)


@app.route("/Shelter-Home/Calender", methods=['GET', 'POST'])
def sh_home_calender():
	error_msg = ''
	if not session.get("id"):
		return redirect("/login")
	else:
		if session.get("u_a") != 'h':
			return redirect("/login")
	r_id = request.args.get('id')
	if r_id == None:
		return redirect(url_for('sh_home_rooms'))
	h_data = homes.find_one({'_id':ObjectId(session.get("id"))})
	h_data['_id'] = str(h_data['_id'])


	return render_template("shelterhome/calender.html", page_name='Calender',emsg=error_msg,r_id=r_id,h_data=h_data)


@app.route("/Shelter-Home/Rooms", methods=['GET', 'POST'])
def sh_home_rooms():
	error_msg = ''
	if not session.get("id"):
		return redirect("/login")
	else:
		if session.get("u_a") != 'h':
			return redirect("/login")

	sh_data = homes.find_one({'_id':ObjectId(session.get("id"))},{} )
	sh_data['_id'] = str(sh_data['_id'])
	
	send_data = room_data_base.find({'home_data_id':session.get("id")})
	new_h_data = []
	i=1
	for x in send_data:
		x['_id'] = str(x['_id'])
		if i%2 == 0:
			oe_ = 'even'
		else:
			oe_ = 'odd'
		new_h_data.append([x,oe_])
		i+=1
	print(new_h_data)


	return render_template("shelterhome/rooms.html", page_name='Rooms',emsg=error_msg,h_data=sh_data,send_data=new_h_data)



@app.route("/Shelter-Home/Rooms/Insert", methods=['GET', 'POST'])
def sh_home_ins_rooms():
	error_msg = ''
	if not session.get("id"):
		return redirect("/login")
	else:
		if session.get("u_a") != 'h':
			return redirect("/login")
	h_data = homes.find_one({'_id':ObjectId(session.get("id"))})
	h_data['_id'] = str(h_data['_id'])

	if (request.method == 'POST'):
		room_type = request.form.get('room_type')
		price = request.form.get('price')
		s_date = request.form.get('s_date')
		e_date = request.form.get('e_date')
		details = request.form.get('details')
		tot_photos = request.form.get('tot_photos')

		main_photo = request.files['photo_main']
		file_name_main = '(' + session.get('id') + "_" + room_type + '_1][).' + ((main_photo.filename).split('.'))[-1]
		main_photo.save( 'static\\img\\upload\\homes\\rooms\\'+file_name_main )
		
		lst_photos = []
		lst_photos.append(file_name_main)
		for i in range(1,int(tot_photos)):
			photo_data = request.files['photo_'+str(i)]
			file_name_tmp = '(' + session.get('id') + "_" + room_type + '_'+str(i+1)+'][).' + ((photo_data.filename).split('.'))[-1]
			photo_data.save( 'static\\img\\upload\\homes\\rooms\\'+file_name_tmp )
			lst_photos.append(file_name_tmp)
		likes = 0
		booked_dates = []

		json_ins_data = {

		"home_data_id":session.get('id'),
		"room_type":room_type,
		"price":price,
		"s_Date":s_date,
		"e_Date":e_date,
		"details":details,
		"photos":lst_photos,
		"likes":0,
		"booked_Dates":[]
		}

		room_data_base.insert_one(json_ins_data)
		return redirect(url_for('sh_home_rooms'))

	return render_template("shelterhome/rooms_ins.html", page_name='Insert Room',emsg=error_msg,h_data=h_data)




@app.route("/Shelter-Home/Rooms/Delete", methods=['GET'])
def sh_home_del_rooms():
	if (request.method == 'GET'):
		id_ = request.args.get('id')
		room_data_base.delete_one({'_id':ObjectId(id_)})
	return redirect(url_for('sh_home_rooms'))





@app.route("/Shelter-Home/API/Calender", methods=['GET'])
def sh_tst():
	data=[]
	if (request.method == 'GET'):
		rid = request.args.get('id')
		booking_api_data = booking_master.find({'room_id':rid})
		room_data_api = room_data_base.find_one({'_id':ObjectId(rid)})
		lst_api_send = []
		i=1
		for x in booking_api_data:
			user_data = user.find_one({'_id':ObjectId(x['u_id'])})
			title = user_data['fname']+' '+user_data['lname']+' '+'took'+' '+room_data_api['room_type']+' '+'in'+' '+room_data_api['price']+' Rs per day'
			start_d = x['s_Date']
			end_d = x['e_Date']
			date_obj = datetime.strptime(end_d, '%Y-%m-%d')
			new_date = (date_obj + timedelta(days=1)).strftime('%Y-%m-%d')
			lst_api_send.append({'title':title,'id':i,'start':start_d,'end':new_date})
			i+=1
		data = lst_api_send
	return jsonify(data)

# --------------- Shelter-Home --------------------




























# --------------- Login --------------------

@app.route("/login", methods=['GET', 'POST'])
def login():
	error_msg = ''
	if session.get("id"):
		if session.get("u_a") == 'a':
			return redirect("/admin")
		elif session.get("u_a") == 'u':
			return redirect(url_for('main'))
		elif session.get("u_a") == 'h':
			return redirect(url_for('sh_home'))

	if (request.method == 'POST'):
		mail = request.form.get('email')
		passs = request.form.get('pass')
		data = user.find_one({'mail':mail,'pass':passs})
		if data != None:
			data['_id'] = str(data['_id'])
			if data['verified'] == '1':
				session['login_permision'] = 1
				session['id'] = data['_id']
				session['u_a'] = 'u'
				print('\n\n\t',mail,passs,'\n\n')
				return redirect(url_for('main'))
			else:
				error_msg = 'Your Account is not Verified'
		else:
			homes_data = homes.find_one({'mail':mail,'pass':passs})
			if homes_data != None:
				if homes_data['verified'] == 1:
					session['login_permision'] = 1
					session['id'] = str(homes_data['_id'])
					session['u_a'] = 'h'
					return redirect(url_for('sh_home'))
				else:
					error_msg = 'Your Account is not Verified'
			else:
				error_msg = 'Wrong Email or Password'
			

	return render_template("login/login.html", page_name='login',emsg=error_msg)

# --------------- Login --------------------










# --------------- Signup --------------------

@app.route("/signup", methods=['GET', 'POST'])
def signup():
	error_msg = ''

	if session.get("id"):
		if session.get("u_a") == 'a':
			return redirect("/admin")
		elif session.get("u_a") == 'u':
			return redirect(url_for('main'))
		elif session.get("u_a") == 'h':
			return redirect(url_for('sh_home'))

	if (request.method == 'POST'):
		mail = request.form.get('email')
		passs = request.form.get('pass')
		repasss = request.form.get('repass')
		fname = request.form.get('fname')
		lname = request.form.get('lname')

		if passs == repasss:
			data = user.find_one({'mail':mail,'pass':passs})
			# print(data)
			if data == None:
				f = request.files['file']
				file_name = '(' + mail + ').' + ((f.filename).split('.'))[-1]
				f.save( 'static\\pdf\\'+file_name )
				
				json_store = {
					"fname":fname,
					"lname":lname,
					"mail":mail,
					"pass":passs,
					"verified":'0',
					"adhar_photo":file_name,
					"otp_veri":'0',
					"a_u":"u"
				}
				session['data_otp_send'] = json_store
				session['otp_send'] = random.randint(100000, 999999)

				print(session['otp_send'])
				send_mial( mail , str(session['otp_send']) )

				return redirect(url_for('otp'))
			else:
				error_msg = 'Email is Already There'
		else:
			error_msg = 'Password and Re-Password not match'

	return render_template("login/signup.html", page_name='signup',emsg=error_msg)

# --------------- Signup --------------------







# --------------- OTP --------------------

@app.route("/otp", methods=['GET', 'POST'])
def otp():
	if session.get("id"):
		if session.get("u_a") == 'a':
			return redirect("/admin")
		elif session.get("u_a") == 'u':
			return redirect(url_for('main'))
		elif session.get("u_a") == 'h':
			return redirect(url_for('sh_home'))

	if (request.method == 'POST'):
		otp = request.form.get('otp')

		if str(otp) == str(session['otp_send']):
			json_store = session['data_otp_send']
			session.clear()

			json_store['otp_veri'] = '1'
			store_ins = user.insert_one(json_store)

			return redirect(url_for('login'))

	return render_template("login/otp.html", page_name='signup')

# --------------- OTP --------------------


# --------------- Re-upload Documnet --------------------
@app.route("/redocument", methods=['GET', 'POST'])
def reupload():
	error_msg=""
	url_id = request.args.get("id")
	flg=0
	umail = ''

	for x in user.find():
		if str(x['_id']) == url_id and (x['verified'] == '2' or x['verified'] == '3') :
			flg = 1
			umail = x['mail']
	if flg==0:
		return redirect(url_for('login'))
	
	return render_template("login/reupload.html", page_name='Re-Document',emsg=error_msg)


@app.route("/document", methods=['GET', 'POST'])
def docc():
	if (request.method == 'POST'):
		idd = request.form.get('idd')
		f = request.files['file']

		mail = ''
		for x in user.find():
			if str(x['_id']) == idd:
				mail = x['mail']

		file_name = '(' + mail + ').' + ((f.filename).split('.'))[-1]
		print(file_name)
		f.save( 'static\\pdf\\'+file_name )

		user.update_one({ "mail": mail }, { "$set": {"verified": "0","adhar_photo":file_name} })
		print(user.find_one({ "mail": mail }, {"verified": "0"} ))
		return redirect(url_for('login'))
	return ''

# --------------- Re-upload Documnet --------------------








# --------------- LOGOUT --------------------

@app.route("/logout")
def logout():
	session.clear()
	return redirect('/')

# --------------- LOGOUT --------------------








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


@app.errorhandler(404)
def not_found_error(error):
	return render_template('404.html'), 404

@app.errorhandler(500)
def not_found_error(error):
	return render_template('500.html'), 500

# @app.errorhandler(Exception)
# def exception_handler(error):
# 	err_msg = repr(error)
# 	print(err_msg)
# 	return err_msg









app.run(debug = True, threaded=True, host='0.0.0.0', port=5001)