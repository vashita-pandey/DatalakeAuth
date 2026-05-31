package com.datalakeauth

import android.content.res.AssetFileDescriptor
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.util.Base64
import com.facebook.react.bridge.*
import org.tensorflow.lite.Interpreter
import java.io.ByteArrayOutputStream
import java.io.FileInputStream
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.MappedByteBuffer
import java.nio.channels.FileChannel
import kotlin.math.sqrt

class TFLiteModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "TFLiteModule"

    private var faceRecognizer: Interpreter? = null

    private fun loadModel(modelName: String): MappedByteBuffer {
        val afd: AssetFileDescriptor =
            reactApplicationContext.assets.openFd(modelName)
        val fis = FileInputStream(afd.fileDescriptor)
        val fc = fis.channel
        return fc.map(FileChannel.MapMode.READ_ONLY, afd.startOffset, afd.declaredLength)
    }

    @ReactMethod
    fun initialize(promise: Promise) {
        try {
            val options = Interpreter.Options().apply { setNumThreads(4) }
            faceRecognizer = Interpreter(loadModel("face_recognition.tflite"), options)
            promise.resolve("TFLite initialized successfully")
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getEmbeddingFromBase64(base64Image: String, promise: Promise) {
        try {
            val recognizer = faceRecognizer
                ?: return promise.reject("NOT_INIT", "TFLite not initialized")

            // Decode base64 to bitmap
            val imageBytes = Base64.decode(base64Image, Base64.DEFAULT)
            val originalBitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
                ?: return promise.reject("DECODE_ERROR", "Failed to decode image")

            // Resize to 112x112
            val resized = Bitmap.createScaledBitmap(originalBitmap, 112, 112, true)

            // Apply CLAHE-like normalization (histogram equalization per channel)
            val normalized = normalizeBitmap(resized)

            // Prepare input buffer
            val inputBuffer = ByteBuffer.allocateDirect(1 * 112 * 112 * 3 * 4)
            inputBuffer.order(ByteOrder.nativeOrder())

            for (y in 0 until 112) {
                for (x in 0 until 112) {
                    val pixel = normalized.getPixel(x, y)
                    val r = ((pixel shr 16) and 0xFF) / 127.5f - 1f
                    val g = ((pixel shr 8) and 0xFF) / 127.5f - 1f
                    val b = (pixel and 0xFF) / 127.5f - 1f
                    inputBuffer.putFloat(r)
                    inputBuffer.putFloat(g)
                    inputBuffer.putFloat(b)
                }
            }
            inputBuffer.rewind()

            // Run inference
            val outputBuffer = Array(1) { FloatArray(128) }
            val startTime = System.currentTimeMillis()
            recognizer.run(inputBuffer, outputBuffer)
            val inferenceTime = System.currentTimeMillis() - startTime

            // L2 normalize the embedding
            val embedding = outputBuffer[0]
            val norm = sqrt(embedding.map { it * it }.sum())
            val normalized_embedding = embedding.map { it / norm }

            // Return result
            val result = WritableNativeMap()
            val embeddingArray = WritableNativeArray()
            normalized_embedding.forEach { embeddingArray.pushDouble(it.toDouble()) }
            result.putArray("embedding", embeddingArray)
            result.putDouble("inferenceTime", inferenceTime.toDouble())

            promise.resolve(result)

            // Clean up
            originalBitmap.recycle()
            resized.recycle()
            normalized.recycle()

        } catch (e: Exception) {
            promise.reject("INFERENCE_ERROR", e.message)
        }
    }

    // Simple per-channel normalization to handle lighting variations
    private fun normalizeBitmap(bitmap: Bitmap): Bitmap {
        val width = bitmap.width
        val height = bitmap.height
        val result = bitmap.copy(Bitmap.Config.ARGB_8888, true)

        val pixels = IntArray(width * height)
        result.getPixels(pixels, 0, width, 0, 0, width, height)

        // Compute mean per channel
        var rSum = 0L; var gSum = 0L; var bSum = 0L
        for (pixel in pixels) {
            rSum += (pixel shr 16) and 0xFF
            gSum += (pixel shr 8) and 0xFF
            bSum += pixel and 0xFF
        }
        val n = pixels.size.toLong()
        val rMean = rSum / n; val gMean = gSum / n; val bMean = bSum / n

        // Compute std per channel
        var rVar = 0.0; var gVar = 0.0; var bVar = 0.0
        for (pixel in pixels) {
            val r = ((pixel shr 16) and 0xFF) - rMean
            val g = ((pixel shr 8) and 0xFF) - gMean
            val b = (pixel and 0xFF) - bMean
            rVar += r * r; gVar += g * g; bVar += b * b
        }
        val rStd = maxOf(sqrt(rVar / n), 1.0)
        val gStd = maxOf(sqrt(gVar / n), 1.0)
        val bStd = maxOf(sqrt(bVar / n), 1.0)

        // Normalize pixels
        for (i in pixels.indices) {
            val pixel = pixels[i]
            val a = (pixel shr 24) and 0xFF
            val r = clamp((((pixel shr 16) and 0xFF) - rMean) / rStd * 64 + 128)
            val g = clamp((((pixel shr 8) and 0xFF) - gMean) / gStd * 64 + 128)
            val b = clamp(((pixel and 0xFF) - bMean) / bStd * 64 + 128)
            pixels[i] = (a shl 24) or (r shl 16) or (g shl 8) or b
        }
        result.setPixels(pixels, 0, width, 0, 0, width, height)
        return result
    }

    private fun clamp(value: Double): Int = maxOf(0, minOf(255, value.toInt()))

    @ReactMethod
    fun computeCosineSimilarity(
        embedding1: ReadableArray,
        embedding2: ReadableArray,
        promise: Promise
    ) {
        try {
            var dot = 0f; var normA = 0f; var normB = 0f
            for (i in 0 until embedding1.size()) {
                val a = embedding1.getDouble(i).toFloat()
                val b = embedding2.getDouble(i).toFloat()
                dot += a * b; normA += a * a; normB += b * b
            }
            val similarity = dot / (sqrt(normA) * sqrt(normB))
            promise.resolve(similarity.toDouble())
        } catch (e: Exception) {
            promise.reject("SIMILARITY_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getEmbedding(pixels: ReadableArray, width: Int, height: Int, promise: Promise) {
        promise.reject("DEPRECATED", "Use getEmbeddingFromBase64 instead")
    }
}