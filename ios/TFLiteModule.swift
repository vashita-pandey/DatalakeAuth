import Foundation
import TensorFlowLite

@objc(TFLiteModule)
class TFLiteModule: NSObject {
  
  private var recognizer: Interpreter?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc func initialize(_ resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      guard let modelPath = Bundle.main.path(
        forResource: "face_recognition",
        ofType: "tflite"
      ) else {
        reject("INIT_ERROR", "Model file not found", nil)
        return
      }
      
      var options = Interpreter.Options()
      options.threadCount = 4
      recognizer = try Interpreter(modelPath: modelPath, options: options)
      try recognizer?.allocateTensors()
      resolve("TFLite initialized successfully")
    } catch {
      reject("INIT_ERROR", error.localizedDescription, nil)
    }
  }
  
  @objc func getEmbeddingFromBase64(_ base64Image: String,
                                     resolver resolve: @escaping RCTPromiseResolveBlock,
                                     rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let recognizer = recognizer else {
      reject("NOT_INIT", "TFLite not initialized", nil)
      return
    }
    
    guard let imageData = Data(base64Encoded: base64Image),
          let uiImage = UIImage(data: imageData),
          let cgImage = uiImage.cgImage else {
      reject("DECODE_ERROR", "Failed to decode image", nil)
      return
    }
    
    // Resize to 112x112
    let size = CGSize(width: 112, height: 112)
    UIGraphicsBeginImageContext(size)
    uiImage.draw(in: CGRect(origin: .zero, size: size))
    let resized = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    
    guard let pixelBuffer = resized?.cgImage else {
      reject("RESIZE_ERROR", "Failed to resize image", nil)
      return
    }
    
    // Prepare input buffer
    let inputSize = 1 * 112 * 112 * 3 * 4
    var inputData = Data(count: inputSize)
    
    // Extract pixels and normalize to [-1, 1]
    let width = 112
    let height = 112
    let bytesPerPixel = 4
    let bytesPerRow = bytesPerPixel * width
    var rawData = [UInt8](repeating: 0, count: height * bytesPerRow)
    
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    guard let context = CGContext(
      data: &rawData,
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: bytesPerRow,
      space: colorSpace,
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else {
      reject("CONTEXT_ERROR", "Failed to create graphics context", nil)
      return
    }
    
    context.draw(pixelBuffer, in: CGRect(x: 0, y: 0, width: width, height: height))
    
    inputData.withUnsafeMutableBytes { ptr in
      guard let floatPtr = ptr.bindMemory(to: Float32.self).baseAddress else { return }
      var idx = 0
      for y in 0..<height {
        for x in 0..<width {
          let pixelIdx = (y * bytesPerRow) + (x * bytesPerPixel)
          let r = Float32(rawData[pixelIdx]) / 127.5 - 1.0
          let g = Float32(rawData[pixelIdx + 1]) / 127.5 - 1.0
          let b = Float32(rawData[pixelIdx + 2]) / 127.5 - 1.0
          floatPtr[idx] = r; idx += 1
          floatPtr[idx] = g; idx += 1
          floatPtr[idx] = b; idx += 1
        }
      }
    }
    
    do {
      let startTime = Date()
      try recognizer.copy(inputData, toInputAt: 0)
      try recognizer.invoke()
      let inferenceTime = Date().timeIntervalSince(startTime) * 1000
      
      let outputTensor = try recognizer.output(at: 0)
      let outputData = outputTensor.data
      let embedding = outputData.withUnsafeBytes { ptr -> [Float32] in
        let floatPtr = ptr.bindMemory(to: Float32.self)
        return Array(floatPtr)
      }
      
      // L2 normalize
      let norm = sqrt(embedding.reduce(0) { $0 + $1 * $1 })
      let normalized = embedding.map { $0 / norm }
      
      resolve([
        "embedding": normalized,
        "inferenceTime": inferenceTime
      ])
    } catch {
      reject("INFERENCE_ERROR", error.localizedDescription, nil)
    }
  }
  
  @objc func computeCosineSimilarity(_ embedding1: [Double],
                                      embedding2: [Double],
                                      resolver resolve: @escaping RCTPromiseResolveBlock,
                                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    var dot: Float = 0
    var normA: Float = 0
    var normB: Float = 0
    
    for i in 0..<embedding1.count {
      let a = Float(embedding1[i])
      let b = Float(embedding2[i])
      dot += a * b
      normA += a * a
      normB += b * b
    }
    
    let similarity = dot / (sqrt(normA) * sqrt(normB))
    resolve(similarity)
  }
}