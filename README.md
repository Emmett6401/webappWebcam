# webappWebcam
이 프로그램은 기존의 https://github.com/Emmett6401/webapp을 확장하는것이다. 
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
