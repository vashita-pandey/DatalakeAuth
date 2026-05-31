import {VisionCameraProxy, Frame} from 'react-native-vision-camera';

// Initialize the frame processor plugin
const plugin = VisionCameraProxy.initFrameProcessorPlugin('faceDetector', {});

// This runs on every camera frame at 60fps
// We sample it manually when needed
export function detectFace(frame: Frame) {
  'worklet';
  if (plugin == null) {
    throw new Error('faceDetector plugin not found');
  }
  return plugin.call(frame);
}

// Convert frame to pixel array for TFLite
export function frameToPixels(frame: Frame): number[] {
  'worklet';
  // Extract center crop of frame (face region)
  const width = frame.width;
  const height = frame.height;
  const pixels: number[] = [];

  // Sample 112x112 from center of frame
  const startX = Math.floor((width - 112) / 2);
  const startY = Math.floor((height - 112) / 2);

  for (let y = startY; y < startY + 112; y++) {
    for (let x = startX; x < startX + 112; x++) {
      // Pack RGB as single int
      pixels.push((255 << 16) | (128 << 8) | 64); // placeholder
    }
  }
  return pixels;
}