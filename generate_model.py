import tensorflow as tf
import numpy as np
import os

assets_dir = r"android\app\src\main\assets"
os.makedirs(assets_dir, exist_ok=True)

print("Building MobileFaceNet model...")

# Build MobileFaceNet architecture
def mobilefacenet(input_shape=(112, 112, 3), embedding_size=128):
    inputs = tf.keras.Input(shape=input_shape)
    
    # Initial conv
    x = tf.keras.layers.Conv2D(64, 3, strides=2, padding='same', use_bias=False)(inputs)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.PReLU(shared_axes=[1, 2])(x)
    
    # Depthwise separable blocks
    for filters, stride, repeat in [(64, 1, 5), (128, 2, 1), (128, 1, 6), (128, 2, 1), (128, 1, 2)]:
        for i in range(repeat):
            s = stride if i == 0 else 1
            residual = x
            x = tf.keras.layers.DepthwiseConv2D(3, strides=s, padding='same', use_bias=False)(x)
            x = tf.keras.layers.BatchNormalization()(x)
            x = tf.keras.layers.PReLU(shared_axes=[1, 2])(x)
            x = tf.keras.layers.Conv2D(filters, 1, padding='same', use_bias=False)(x)
            x = tf.keras.layers.BatchNormalization()(x)
            if s == 1 and residual.shape[-1] == x.shape[-1]:
                x = tf.keras.layers.Add()([x, residual])
    
    # Final layers
    x = tf.keras.layers.Conv2D(512, 1, use_bias=False)(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.PReLU(shared_axes=[1, 2])(x)
    x = tf.keras.layers.DepthwiseConv2D(7, use_bias=False)(x)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.Flatten()(x)
    x = tf.keras.layers.Dense(embedding_size, use_bias=False)(x)
    x = tf.keras.layers.BatchNormalization()(x)
    
    model = tf.keras.Model(inputs, x)
    return model

model = mobilefacenet()
model.summary()

print("\nConverting to TFLite with INT8 quantization...")

converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]

def representative_dataset():
    for _ in range(100):
        yield [np.random.uniform(0, 1, (1, 112, 112, 3)).astype(np.float32)]

converter.representative_dataset = representative_dataset
converter.target_spec.supported_ops = [tf.lite.OpsSet.TFLITE_BUILTINS_INT8]
converter.inference_input_type = tf.float32
converter.inference_output_type = tf.float32

tflite_model = converter.convert()

output_path = os.path.join(assets_dir, "face_recognition.tflite")
with open(output_path, 'wb') as f:
    f.write(tflite_model)

size = os.path.getsize(output_path)
print(f"\nDone! Model saved to {output_path}")
print(f"Model size: {size / 1024 / 1024:.2f} MB")