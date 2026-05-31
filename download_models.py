import urllib.request
import os

assets_dir = r"android\app\src\main\assets"
os.makedirs(assets_dir, exist_ok=True)

print("Downloading MobileFaceNet model...")
url = "https://github.com/google-coral/test_data/raw/master/mobilenet_v2_1.0_224_inat_bird_quant.tflite"

# We'll use a known working TFLite model for face embedding
# MobileFaceNet from facenet-pytorch converted model
urls_to_try = [
    "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx",
]

# Download SFace model from OpenCV Zoo
print("Downloading SFace recognition model...")
urllib.request.urlretrieve(
    "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec_int8bq.onnx",
    os.path.join(assets_dir, "face_recognition.onnx")
)
print("Done!")

import os
size = os.path.getsize(os.path.join(assets_dir, "face_recognition.onnx"))
print(f"File size: {size} bytes")