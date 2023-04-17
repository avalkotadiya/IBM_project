from pyzbar import pyzbar
import webbrowser
import cv2
import json
import xmltodict


image = cv2.imread("ketan.jpg")
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
barcodes = pyzbar.decode(gray)

barcodeData=''
for barcode in barcodes:
	barcodeData = barcode.data.decode("utf-8")
	barcodeType = barcode.type

xml_json = xmltodict.parse(barcodeData)

print(xml_json['PrintLetterBarcodeData'])