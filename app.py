from flask import Flask, render_template, request, redirect
import csv
import os
import base64
from datetime import datetime

app = Flask(__name__)

UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Route for the home page
@app.route('/')
def index():
    return render_template('index.html')

# Route to handle form submission
@app.route('/add', methods=['POST'])
def add_contact():
    name = request.form['pyname']
    phone = request.form['pyphone']
    birthday = request.form['pybirthday']
    photo = request.files.get('pyphoto')
    webcam_image = request.form.get('webcamImage')

    photo_name_to_save = ''

    # 파일 업로드가 있을 때
    if photo and getattr(photo, 'filename', ''):
        photo_filename = os.path.join(app.config['UPLOAD_FOLDER'], photo.filename)
        photo.save(photo_filename)
        photo_name_to_save = photo.filename
    # 웹캠 이미지가 있을 때
    elif webcam_image:
        # 파일명 생성 (예: webcam_20240521_153012.png)
        now_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        photo_name_to_save = f'webcam_{now_str}.png'
        photo_filename = os.path.join(app.config['UPLOAD_FOLDER'], photo_name_to_save)
        # base64 헤더 제거 및 디코딩
        header, data = webcam_image.split(',', 1)
        with open(photo_filename, 'wb') as f:
            f.write(base64.b64decode(data))

    # Save to addbook.txt in CSV format (사진 파일명도 저장)
    with open('addbook.txt', 'a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow([name, phone, birthday, photo_name_to_save])

    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)