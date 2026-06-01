# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# TFLite - critical, must not be stripped
-keep class org.tensorflow.** { *; }
-keep class org.tensorflow.lite.** { *; }
-keep class org.tensorflow.lite.gpu.** { *; }
-dontwarn org.tensorflow.**

# Our native module
-keep class com.datalakeauth.TFLiteModule { *; }
-keep class com.datalakeauth.TFLitePackage { *; }
-keep class com.datalakeauth.** { *; }

# VisionCamera
-keep class com.mrousavy.camera.** { *; }
-dontwarn com.mrousavy.camera.**

# Reanimated
-keep class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

# Worklets
-keep class com.swmansion.worklets.** { *; }

# Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# NetInfo
-keep class com.reactnativecommunity.netinfo.** { *; }

# General Android
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
-dontwarn java.lang.invoke.*
-dontwarn **$$Lambda$*