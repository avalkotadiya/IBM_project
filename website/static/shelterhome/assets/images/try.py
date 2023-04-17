from PIL import Image
 
input_img = Image.open('tst.jpg')
old_w = input_img.size[0]
old_h = input_img.size[1]
ch_w = int((old_h*100)/66)
ch_h = int((old_w*66)/100)

if old_w > ch_w:
	new_w = ch_w
	new_h = old_h
if old_h > ch_h:
	new_w = old_w
	new_h = ch_h

input_img = input_img.resize((new_w, new_h))
input_img.save('tst_!.jpg')