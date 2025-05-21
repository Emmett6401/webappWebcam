# webappWebcam
이 프로그램은 기존의 https://github.com/Emmett6401/webapp을 확장하는것이다. 

## 프로그램 실행 방법
```
git clone https://github.com/Emmett6401/webappWebcam
pip install -r requirements.txt
python app.py
```
또는 
```
set FLASK_APP=app.py
set FLASK_ENV=development
flask run
```

## 1차 확장 기능 
1. 웹브라우저에서 파일을 선택해서 서버로 전송
2. 서버는 이미지 파일을 /static/uploads 폴더에 저장혹
3. addbook.txt 파일에 이미지 파일 이름을 저장하게 한다.
   <img width="511" alt="image" src="https://github.com/user-attachments/assets/c138fe2e-a7ba-426a-90a7-0ca1573e187d" />

### 주요 수정 내용 
### 1. index.html
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Address Book</title>
    <!-- CSS 파일 연결 -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
    <h1>Address Book</h1>
    <form action="/add" method="post" enctype="multipart/form-data">
        <label for="name" class="label-name">Name:</label>
        <input type="text" id="name" name="pyname" required>
        <br><br>
        <label for="phone">Phone:</label>
        <input type="text" id="phone" name="pyphone" required>
        <br><br>
        <label for="birthday">Birthday:</label>
        <input type="date" id="birthday" name="pybirthday" required>
        <br><br>
        <label for="photo">Photo:</label>
        <input type="file" id="photo" name="pyphoto" accept="image/*" onchange="previewPhoto(event)">
        <br><br>
        <img id="photoPreview" src="#" alt="Photo Preview" style="display:none; max-width:200px;"/>
        <br><br>
        <button type="submit">Add Contact</button>        
    </form>
        <script>
        function previewPhoto(event) {
            const input = event.target;
            const preview = document.getElementById('photoPreview');
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(input.files[0]);
            } else {
                preview.src = '#';
                preview.style.display = 'none';
            }
        }
    </script>
</body>
</html>
```
주요 수정 부분중    
<form action="/add" method="post" enctype="multipart/form-data">    
  이 코드는 HTML 폼(form) 태그의 속성을 설정하는 부분입니다.    

action="/add"   
폼을 제출(submit)하면 데이터를 /add 경로(Flask의 /add 라우트)로 보냅니다.   

method="post"    
데이터를 서버로 보낼 때 HTTP POST 방식(숨겨진 방식, URL에 데이터가 노출되지 않음)으로 전송합니다.    

enctype="multipart/form-data"    
폼에 파일 업로드(input type="file")가 있을 때 반드시 필요한 속성입니다.    
이 속성이 있어야 파일 데이터가 서버로 전송됩니다.    
(없으면 request.files에서 파일을 받을 수 없습니다.)   

폼 내부에 생일 입력 받는 곳과 파일 선택하는 곳이 추가 됨.
  ```
<input type="date" id="birthday" name="pybirthday" required>
        <br><br>
        <label for="photo">Photo:</label>
        <input type="file" id="photo" name="pyphoto" accept="image/*" onchange="previewPhoto(event)">
        <br><br>
        <img id="photoPreview" src="#" alt="Photo Preview" style="display:none; max-width:200px;"/>
        <br><br>
```
스크립트가 추가 됨 파일 선택하고 onchange 되었을때 호출 되는 함수 
```
    <script>
        function previewPhoto(event) {
            const input = event.target;
            const preview = document.getElementById('photoPreview');
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(input.files[0]);
            } else {
                preview.src = '#';
                preview.style.display = 'none';
            }
        }
    </script>
```
### 2. app.py에서
   ```
@app.route('/add', methods=['POST'])
def add_contact():
    name = request.form['pyname']
    phone = request.form['pyphone']
    birthday = request.form['pybirthday']
    photo = request.files.get('pyphoto')

    photo_name_to_save = ''
    if photo and getattr(photo, 'filename', ''):
        photo_filename = os.path.join(app.config['UPLOAD_FOLDER'], photo.filename)
        photo.save(photo_filename)
        photo_name_to_save = photo.filename

    # Save to addbook.txt in CSV format (사진 파일명도 저장)
    with open('addbook.txt', 'a', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow([name, phone, birthday, photo_name_to_save])

    return redirect('/')
 ```
파일내용을 받아서 static/uploads 폴더에 저장하고 
파일이름을 addbook.txt에 함께 저장하고 있다., 

#### 실행 화면 
<img width="190" alt="image" src="https://github.com/user-attachments/assets/a3b35487-f95e-4f2f-9a36-56803e04643e" />

#### 이미지가 저장된 
![image](https://github.com/user-attachments/assets/021db7fb-d570-4560-bba1-600aea35084b)

## 2차 확장 기능 
## 웹 카메라로 직접 촬영해서 올리기
### 1.index.html
버튼 추가    
![image](https://github.com/user-attachments/assets/1b5423eb-d2a5-4d29-9f75-19df34f0eff0)
함수 추가    
![image](https://github.com/user-attachments/assets/1a57d3c0-8c0a-436d-ac64-dbca5c8d787e)

```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Address Book</title>
    <!-- CSS 파일 연결 -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
    <h1>Address Book</h1>
    <form action="/add" method="post" enctype="multipart/form-data">
        <label for="name" class="label-name">Name:</label>
        <input type="text" id="name" name="pyname" required>
        <br><br>
        <label for="phone">Phone:</label>
        <input type="text" id="phone" name="pyphone" required>
        <br><br>
        <label for="birthday">Birthday:</label>
        <input type="date" id="birthday" name="pybirthday" required>
        <br><br>
        <label for="photo">Photo:</label>
        <input type="file" id="photo" name="pyphoto" accept="image/*" onchange="previewPhoto(event)">
        <button type="button" onclick="openCamera()">웹캠 촬영</button>
        <br><br>
        <video id="camera" width="200" autoplay style="display:none;"></video>
        <canvas id="canvas" width="200" style="display:none;"></canvas>
        <img id="photoPreview" src="#" alt="Photo Preview" style="display:none; max-width:200px;"/>
        <br><br>
        <button type="submit">Add Contact</button>        
    </form>
    <script>
        function previewPhoto(event) {
            const input = event.target;
            const preview = document.getElementById('photoPreview');
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(input.files[0]);
            } else {
                preview.src = '#';
                preview.style.display = 'none';
            }
        }

        function openCamera() {
            const video = document.getElementById('camera');
            const canvas = document.getElementById('canvas');
            video.style.display = 'block';
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;
                    video.play();
                    // 촬영 버튼 추가
                    if (!document.getElementById('captureBtn')) {
                        const btn = document.createElement('button');
                        btn.textContent = '촬영';
                        btn.type = 'button';
                        btn.id = 'captureBtn';
                        btn.onclick = function() {
                            capturePhoto(video, canvas);
                        };
                        video.parentNode.insertBefore(btn, video.nextSibling);
                    }
                })
                .catch(err => {
                    alert('웹캠을 사용할 수 없습니다: ' + err);
                });
        }

        function capturePhoto(video, canvas) {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            // 미리보기
            const dataURL = canvas.toDataURL('image/png');
            document.getElementById('photoPreview').src = dataURL;
            document.getElementById('photoPreview').style.display = 'block';
            // input[type=file]을 비움
            document.getElementById('photo').value = '';
            // dataURL을 hidden input에 저장
            let hidden = document.getElementById('webcamImage');
            if (!hidden) {
                hidden = document.createElement('input');
                hidden.type = 'hidden';
                hidden.name = 'webcamImage';
                hidden.id = 'webcamImage';
                document.querySelector('form').appendChild(hidden);
            }
            hidden.value = dataURL;
            // 웹캠 끄기
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
            video.style.display = 'none';
            canvas.style.display = 'none';
            // 촬영 버튼 제거
            const btn = document.getElementById('captureBtn');
            if (btn) btn.remove();
        }
    </script>
</body>
</html>
```
### 2. app.py
![image](https://github.com/user-attachments/assets/8487b5fc-f531-49d2-a245-fe188ee22417)
파일 업로드와 웹카메라를 선택적으로 저장하고 있음
```
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
```
## 실행 화면 
![image](https://github.com/user-attachments/assets/3c3d342a-0263-4f6a-9772-1cd2a71a19d1)

## 촬영된 사진 
![image](https://github.com/user-attachments/assets/3d4369fd-da9a-4a88-959b-51104cd14036)

## 저장된 데이터 

![image](https://github.com/user-attachments/assets/22719a5b-15a1-48c9-9164-bf24c4762e08)

## 캐쉬 없애는 방법 

![image](https://github.com/user-attachments/assets/31890344-0717-4cf3-be02-661333204291)
```
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Address Book</title>
    <!-- 캐시 방지용 meta 태그 (크롬 등에서 캐시 최소화) -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <!-- CSS 파일 연결 (버전 쿼리스트링 추가) -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}?v={{ config['VERSION'] if config.get('VERSION') else 1 }}">
</head>
```
## 최종적으로 코드 분리해서 정리 

index.html에 있는 script 부분을 js로 옮겼다.    
가독성을 좋게 하기 위함이다.    

프로그램은 이상없이 잘 실행 되는것을 확인 했다.    
index.html의 최종 코드는 
```
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Address Book</title>
    <!-- 캐시 방지용 meta 태그 (크롬 등에서 캐시 최소화) -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <!-- CSS 파일 연결 (버전 쿼리스트링 추가) -->
    <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}?v={{ config['VERSION'] if config.get('VERSION') else 1 }}">
</head>
<body>
    <h1>Address Book</h1>
    <form action="/add" method="post" enctype="multipart/form-data">
        <label for="name" class="label-name">Name:</label>
        <input type="text" id="name" name="pyname" required>
        <br><br>
        <label for="phone">Phone:</label>
        <input type="text" id="phone" name="pyphone" required>
        <br><br>
        <label for="birthday">Birthday:</label>
        <input type="date" id="birthday" name="pybirthday" required>
        <br><br>
        <label for="photo">Photo:</label>
        <input type="file" id="photo" name="pyphoto" accept="image/*" onchange="previewPhoto(event)">
        <button type="button" onclick="openCamera()">웹캠 촬영</button>
        <br><br>
        <video id="camera" width="200" autoplay style="display:none;"></video>
        <canvas id="canvas" width="200" style="display:none;"></canvas>
        <img id="photoPreview" src="#" alt="Photo Preview" style="display:none; max-width:200px;"/>
        <br><br>
        <button type="submit">Add Contact</button>        
    </form>
    <!-- JS 파일 분리 -->
    <script src="{{ url_for('static', filename='js/main.js') }}?v={{ config['VERSION'] if config.get('VERSION') else 1 }}"></script>
</body>
</html>
```
main.js는 
```
function previewPhoto(event) {
    const input = event.target;
    const preview = document.getElementById('photoPreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.src = '#';
        preview.style.display = 'none';
    }
}

function openCamera() {
    const video = document.getElementById('camera');
    const canvas = document.getElementById('canvas');
    video.style.display = 'block';
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
            // 촬영 버튼 추가
            if (!document.getElementById('captureBtn')) {
                const btn = document.createElement('button');
                btn.textContent = '촬영';
                btn.type = 'button';
                btn.id = 'captureBtn';
                btn.onclick = function() {
                    capturePhoto(video, canvas);
                };
                video.parentNode.insertBefore(btn, video.nextSibling);
            }
        })
        .catch(err => {
            alert('웹캠을 사용할 수 없습니다: ' + err);
        });
}

function capturePhoto(video, canvas) {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    // 미리보기
    const dataURL = canvas.toDataURL('image/png');
    document.getElementById('photoPreview').src = dataURL;
    document.getElementById('photoPreview').style.display = 'block';
    // input[type=file]을 비움
    document.getElementById('photo').value = '';
    // dataURL을 hidden input에 저장
    let hidden = document.getElementById('webcamImage');
    if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'webcamImage';
        hidden.id = 'webcamImage';
        document.querySelector('form').appendChild(hidden);
    }
    hidden.value = dataURL;
    // 웹캠 끄기
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    video.style.display = 'none';
    canvas.style.display = 'none';
    // 촬영 버튼 제거
    const btn = document.getElementById('captureBtn');
    if (btn) btn.remove();
}

```





