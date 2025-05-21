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