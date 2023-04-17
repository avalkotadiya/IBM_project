# https://apisetu.gov.in/gstn/v2/taxpayers/24BLFPS9156J1ZK




# /**API to fetch the details of a tax payer using GST identiication number**/

import http.client

conn = http.client.HTTPSConnection("apisetu.gov.in")

headers = { 'X-APISETU-CLIENTID': "REPLACE_KEY_VALUE" }

conn.request("GET", "/gstn/v2/taxpayers/%7Bgstin%7D", headers=headers)

res = conn.getresponse()
data = res.read()

print(data.decode("utf-8"))