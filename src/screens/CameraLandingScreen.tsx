import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DragState {
  startX: number;
  startY: number;
  startCropX: number;
  startCropY: number;
}

interface ResizeState {
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startCropX: number;
  startCropY: number;
}

export default function CameraLandingScreen() {
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<'off' | 'on' | 'auto'>('off');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [photoInfo, setPhotoInfo] = useState<{ width: number; height: number } | null>(null);
  const [cropRegion, setCropRegion] = useState<CropRegion | null>(null);
  const dragStateRef = useRef<DragState>({
    startX: 0,
    startY: 0,
    startCropX: 0,
    startCropY: 0,
  });
  const resizeStateRef = useRef<ResizeState>({
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startCropX: 0,
    startCropY: 0,
  });

  useEffect(() => {
    console.log('Camera permission status:', permission);
  }, [permission]);

  const handleCameraReady = () => {
    console.log('Camera is ready');
    setCameraReady(true);
  };

  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady) {
      Alert.alert('Camera not ready', 'Please wait for the camera to initialize');
      return;
    }

    try {
      console.log('Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        skipProcessing: false,
      });
      console.log('Picture taken:', photo);
      
      // Set captured photo
      setCapturedPhoto(photo.uri);
      setPhotoInfo({ width: photo.width, height: photo.height });
      
      // Initialize crop region (60% width, 40% height, centered)
      const cropW = photo.width * 0.6;
      const cropH = photo.height * 0.4;
      const cropX = (photo.width - cropW) / 2;
      const cropY = (photo.height - cropH) / 2;
      
      setCropRegion({
        x: cropX,
        y: cropY,
        width: cropW,
        height: cropH,
      });
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture. Please try again.');
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => 
      current === 'back' ? 'front' : 'back'
    );
  };

  const toggleFlash = () => {
    setFlashMode(current => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  const getFlashIcon = () => {
    if (flashMode === 'on') return 'flash';
    if (flashMode === 'auto') return 'flash-outline';
    return 'flash-off';
  };

  const handleCropDragStart = (e: any, scaleX: number, scaleY: number) => {
    if (!cropRegion) return;
    const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
    dragStateRef.current = {
      startX: touch.pageX,
      startY: touch.pageY,
      startCropX: cropRegion.x,
      startCropY: cropRegion.y,
    };
  };

  const handleCropDrag = (e: any, scaleX: number, scaleY: number) => {
    if (!cropRegion || !photoInfo) return;
    const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
    const deltaX = (touch.pageX - dragStateRef.current.startX) / scaleX;
    const deltaY = (touch.pageY - dragStateRef.current.startY) / scaleY;

    let newX = dragStateRef.current.startCropX + deltaX;
    let newY = dragStateRef.current.startCropY + deltaY;

    // Keep crop box within image boundaries
    newX = Math.max(0, Math.min(newX, photoInfo.width - cropRegion.width));
    newY = Math.max(0, Math.min(newY, photoInfo.height - cropRegion.height));

    setCropRegion({
      ...cropRegion,
      x: newX,
      y: newY,
    });
  };

  const handleResizeStart = (e: any, scaleX: number, scaleY: number) => {
    if (!cropRegion) return;
    const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
    resizeStateRef.current = {
      startX: touch.pageX,
      startY: touch.pageY,
      startWidth: cropRegion.width,
      startHeight: cropRegion.height,
      startCropX: cropRegion.x,
      startCropY: cropRegion.y,
    };
  };

  const handleResizeBottomRight = (e: any, scaleX: number, scaleY: number) => {
    if (!cropRegion || !photoInfo) return;
    const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
    const deltaX = (touch.pageX - resizeStateRef.current.startX) / scaleX;
    const deltaY = (touch.pageY - resizeStateRef.current.startY) / scaleY;

    let newWidth = resizeStateRef.current.startWidth + deltaX;
    let newHeight = resizeStateRef.current.startHeight + deltaY;

    const minSize = 50;
    newWidth = Math.max(minSize, Math.min(newWidth, photoInfo.width - cropRegion.x));
    newHeight = Math.max(minSize, Math.min(newHeight, photoInfo.height - cropRegion.y));

    setCropRegion({
      ...cropRegion,
      width: newWidth,
      height: newHeight,
    });
  };

  const handleResizeTopLeft = (e: any, scaleX: number, scaleY: number) => {
    if (!cropRegion || !photoInfo) return;
    const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
    const deltaX = (touch.pageX - resizeStateRef.current.startX) / scaleX;
    const deltaY = (touch.pageY - resizeStateRef.current.startY) / scaleY;

    let newWidth = resizeStateRef.current.startWidth - deltaX;
    let newHeight = resizeStateRef.current.startHeight - deltaY;
    let newX = resizeStateRef.current.startCropX + deltaX;
    let newY = resizeStateRef.current.startCropY + deltaY;

    const minSize = 50;
    newWidth = Math.max(minSize, newWidth);
    newHeight = Math.max(minSize, newHeight);
    newX = Math.max(0, Math.min(newX, photoInfo.width - minSize));
    newY = Math.max(0, Math.min(newY, photoInfo.height - minSize));

    setCropRegion({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  };

  const handleResizeTopRight = (e: any, scaleX: number, scaleY: number) => {
    if (!cropRegion || !photoInfo) return;
    const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
    const deltaX = (touch.pageX - resizeStateRef.current.startX) / scaleX;
    const deltaY = (touch.pageY - resizeStateRef.current.startY) / scaleY;

    let newWidth = resizeStateRef.current.startWidth + deltaX;
    let newHeight = resizeStateRef.current.startHeight - deltaY;
    let newY = resizeStateRef.current.startCropY + deltaY;

    const minSize = 50;
    newWidth = Math.max(minSize, Math.min(newWidth, photoInfo.width - cropRegion.x));
    newHeight = Math.max(minSize, newHeight);
    newY = Math.max(0, Math.min(newY, photoInfo.height - minSize));

    setCropRegion({
      ...cropRegion,
      y: newY,
      width: newWidth,
      height: newHeight,
    });
  };

  const handleResizeBottomLeft = (e: any, scaleX: number, scaleY: number) => {
    if (!cropRegion || !photoInfo) return;
    const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
    const deltaX = (touch.pageX - resizeStateRef.current.startX) / scaleX;
    const deltaY = (touch.pageY - resizeStateRef.current.startY) / scaleY;

    let newWidth = resizeStateRef.current.startWidth - deltaX;
    let newHeight = resizeStateRef.current.startHeight + deltaY;
    let newX = resizeStateRef.current.startCropX + deltaX;

    const minSize = 50;
    newWidth = Math.max(minSize, newWidth);
    newHeight = Math.max(minSize, Math.min(newHeight, photoInfo.height - cropRegion.y));
    newX = Math.max(0, Math.min(newX, photoInfo.width - minSize));

    setCropRegion({
      x: newX,
      y: cropRegion.y,
      width: newWidth,
      height: newHeight,
    });
  };

  const handleResizeTop = (e: any, scaleX: number, scaleY: number) => {
    if (!cropRegion || !photoInfo) return;
    const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
    const deltaY = (touch.pageY - resizeStateRef.current.startY) / scaleY;

    let newHeight = resizeStateRef.current.startHeight - deltaY;
    let newY = resizeStateRef.current.startCropY + deltaY;

    const minSize = 50;
    newHeight = Math.max(minSize, newHeight);
    newY = Math.max(0, Math.min(newY, photoInfo.height - minSize));

    setCropRegion({
      ...cropRegion,
      y: newY,
      height: newHeight,
    });
  };

  const handleResizeBottom = (e: any, scaleX: number, scaleY: number) => {
    if (!cropRegion || !photoInfo) return;
    const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
    const deltaY = (touch.pageY - resizeStateRef.current.startY) / scaleY;

    let newHeight = resizeStateRef.current.startHeight + deltaY;

    const minSize = 50;
    newHeight = Math.max(minSize, Math.min(newHeight, photoInfo.height - cropRegion.y));

    setCropRegion({
      ...cropRegion,
      height: newHeight,
    });
  };

  const handleResizeLeft = (e: any, scaleX: number, scaleY: number) => {
    if (!cropRegion || !photoInfo) return;
    const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
    const deltaX = (touch.pageX - resizeStateRef.current.startX) / scaleX;

    let newWidth = resizeStateRef.current.startWidth - deltaX;
    let newX = resizeStateRef.current.startCropX + deltaX;

    const minSize = 50;
    newWidth = Math.max(minSize, newWidth);
    newX = Math.max(0, Math.min(newX, photoInfo.width - minSize));

    setCropRegion({
      ...cropRegion,
      x: newX,
      width: newWidth,
    });
  };

  const handleResizeRight = (e: any, scaleX: number, scaleY: number) => {
    if (!cropRegion || !photoInfo) return;
    const touch = e.nativeEvent.touches ? e.nativeEvent.touches[0] : e.nativeEvent;
    const deltaX = (touch.pageX - resizeStateRef.current.startX) / scaleX;

    let newWidth = resizeStateRef.current.startWidth + deltaX;

    const minSize = 50;
    newWidth = Math.max(minSize, Math.min(newWidth, photoInfo.width - cropRegion.x));

    setCropRegion({
      ...cropRegion,
      width: newWidth,
    });
  };

  const closeCropBox = () => {
    setCapturedPhoto(null);
    setPhotoInfo(null);
    setCropRegion(null);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={64} color="#FFFFFF" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need your permission to use the camera for taking photos.
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Show photo with crop box if photo is captured
  if (capturedPhoto && photoInfo && cropRegion) {
    return (
      <View style={styles.container}>
        <SimpleCropBox
          imageUri={capturedPhoto}
          imageWidth={photoInfo.width}
          imageHeight={photoInfo.height}
          cropRegion={cropRegion}
          onCropDragStart={handleCropDragStart}
          onCropDrag={handleCropDrag}
          onResizeStart={handleResizeStart}
          onResizeBottomRight={handleResizeBottomRight}
          onResizeTopLeft={handleResizeTopLeft}
          onResizeTopRight={handleResizeTopRight}
          onResizeBottomLeft={handleResizeBottomLeft}
          onResizeTop={handleResizeTop}
          onResizeBottom={handleResizeBottom}
          onResizeLeft={handleResizeLeft}
          onResizeRight={handleResizeRight}
          onClose={closeCropBox}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraType}
          flash={flashMode}
          onCameraReady={handleCameraReady}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.brandContainer}>
              <Text style={styles.brandEmoji}>🎁</Text>
              <Text style={styles.brandText}>Get pro</Text>
            </View>
            
            {/* Camera Status */}
            {!cameraReady && (
              <View style={styles.cameraStatus}>
                <Ionicons name="sync-outline" size={16} color="#FFFFFF" />
                <Text style={styles.cameraStatusText}>Initializing...</Text>
              </View>
            )}
          </View>

          {/* Center Content */}
          <View style={styles.centerContent}>
            <Text style={styles.instructionText}>
              Take a pic and get{'\n'}an answer
            </Text>
          </View>

          {/* Camera Controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity style={styles.flipButton} onPress={toggleCameraType}>
              <Ionicons name="camera-reverse-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Flash Toggle Button */}
          <View style={styles.flashButtonContainer}>
            <TouchableOpacity 
              style={styles.flashButton} 
              onPress={toggleFlash}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={getFlashIcon()} 
                size={20} 
                color={flashMode === 'off' ? '#FFFFFF' : '#FFD700'} 
              />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>

      {/* Footer */}
      <View style={styles.footerWrapper}>
        <View style={styles.whiteTopBorder} />
        <View style={styles.footerContent}>
          <View style={styles.captureContainer}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <View style={styles.iconButtonInner}>
                <Ionicons name="images-outline" size={28} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.captureButton} 
              activeOpacity={0.7}
              onPress={takePicture}
              disabled={!cameraReady}
            >
              <View style={styles.outerRing}>
                <View style={styles.middleRing}>
                  <View style={styles.innerCircle} />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <View style={styles.iconButtonInner}>
                <Ionicons name="mic-outline" size={28} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomNavigation}>
            <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
              <Ionicons name="search-outline" size={24} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>

            <View style={styles.cameraNavItem}>
              <View style={styles.cameraIconWrapper}>
                <View style={styles.cameraIconBackground}>
                  <Ionicons name="camera-outline" size={26} color="#007AFF" />
                </View>
              </View>
              <View style={styles.cameraIndicator} />
            </View>

            <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
              <Ionicons name="person-outline" size={24} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

interface SimpleCropBoxProps {
  imageUri: string;
  imageWidth: number;
  imageHeight: number;
  cropRegion: CropRegion;
  onCropDragStart: (e: any, scaleX: number, scaleY: number) => void;
  onCropDrag: (e: any, scaleX: number, scaleY: number) => void;
  onResizeStart: (e: any, scaleX: number, scaleY: number) => void;
  onResizeBottomRight: (e: any, scaleX: number, scaleY: number) => void;
  onResizeTopLeft: (e: any, scaleX: number, scaleY: number) => void;
  onResizeTopRight: (e: any, scaleX: number, scaleY: number) => void;
  onResizeBottomLeft: (e: any, scaleX: number, scaleY: number) => void;
  onResizeTop: (e: any, scaleX: number, scaleY: number) => void;
  onResizeBottom: (e: any, scaleX: number, scaleY: number) => void;
  onResizeLeft: (e: any, scaleX: number, scaleY: number) => void;
  onResizeRight: (e: any, scaleX: number, scaleY: number) => void;
  onClose: () => void;
}

function SimpleCropBox({
  imageUri,
  imageWidth,
  imageHeight,
  cropRegion,
  onCropDragStart,
  onCropDrag,
  onResizeStart,
  onResizeBottomRight,
  onResizeTopLeft,
  onResizeTopRight,
  onResizeBottomLeft,
  onResizeTop,
  onResizeBottom,
  onResizeLeft,
  onResizeRight,
  onClose,
}: SimpleCropBoxProps) {
  // Calculate display dimensions to fit image on screen
  const maxWidth = SCREEN_WIDTH;
  const maxHeight = SCREEN_HEIGHT * 0.8;
  
  let displayWidth = maxWidth;
  let displayHeight = (imageHeight / imageWidth) * displayWidth;
  
  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = (imageWidth / imageHeight) * displayHeight;
  }

  const scaleX = displayWidth / imageWidth;
  const scaleY = displayHeight / imageHeight;

  // Always use the web/simple version - gesture handler not available for web bundling
  return (
    <View style={styles.cropBoxContainer}>
      <View style={styles.cropBoxWrapper}>
        {/* Image with overlay */}
        <View style={[styles.imageContainer, { width: displayWidth, height: displayHeight }]}>
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} />
          
          {/* Dark overlay outside crop area */}
          <View
            style={[
              styles.darkOverlay,
              {
                top: 0,
                left: 0,
                right: 0,
                height: cropRegion.y * scaleY,
              },
            ]}
          />
          <View
            style={[
              styles.darkOverlay,
              {
                bottom: 0,
                left: 0,
                right: 0,
                height: (imageHeight - cropRegion.y - cropRegion.height) * scaleY,
              },
            ]}
          />
          <View
            style={[
              styles.darkOverlay,
              {
                top: cropRegion.y * scaleY,
                left: 0,
                width: cropRegion.x * scaleX,
                height: cropRegion.height * scaleY,
              },
            ]}
          />
          <View
            style={[
              styles.darkOverlay,
              {
                top: cropRegion.y * scaleY,
                right: 0,
                width: (imageWidth - cropRegion.x - cropRegion.width) * scaleX,
                height: cropRegion.height * scaleY,
              },
            ]}
          />

          {/* Crop box with interactive handles */}
          <InteractiveCropBox
            cropRegion={cropRegion}
            scaleX={scaleX}
            scaleY={scaleY}
            onCropDragStart={onCropDragStart}
            onCropDrag={onCropDrag}
            onResizeStart={onResizeStart}
            onResizeBottomRight={onResizeBottomRight}
            onResizeTopLeft={onResizeTopLeft}
            onResizeTopRight={onResizeTopRight}
            onResizeBottomLeft={onResizeBottomLeft}
            onResizeTop={onResizeTop}
            onResizeBottom={onResizeBottom}
            onResizeLeft={onResizeLeft}
            onResizeRight={onResizeRight}
          />
        </View>

        {/* Action buttons */}
        <View style={styles.cropActionButtons}>
          <TouchableOpacity style={styles.cropCancelButton} onPress={onClose}>
            <Text style={styles.cropButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cropConfirmButton} onPress={onClose}>
            <Text style={styles.cropButtonText}>Crop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Interactive crop box component using touch events for mobile
interface InteractiveCropBoxProps {
  cropRegion: CropRegion;
  scaleX: number;
  scaleY: number;
  onCropDragStart: (e: any, scaleX: number, scaleY: number) => void;
  onCropDrag: (e: any, scaleX: number, scaleY: number) => void;
  onResizeStart: (e: any, scaleX: number, scaleY: number) => void;
  onResizeBottomRight: (e: any, scaleX: number, scaleY: number) => void;
  onResizeTopLeft: (e: any, scaleX: number, scaleY: number) => void;
  onResizeTopRight: (e: any, scaleX: number, scaleY: number) => void;
  onResizeBottomLeft: (e: any, scaleX: number, scaleY: number) => void;
  onResizeTop: (e: any, scaleX: number, scaleY: number) => void;
  onResizeBottom: (e: any, scaleX: number, scaleY: number) => void;
  onResizeLeft: (e: any, scaleX: number, scaleY: number) => void;
  onResizeRight: (e: any, scaleX: number, scaleY: number) => void;
}

function InteractiveCropBox({
  cropRegion,
  scaleX,
  scaleY,
  onCropDragStart,
  onCropDrag,
  onResizeStart,
  onResizeBottomRight,
  onResizeTopLeft,
  onResizeTopRight,
  onResizeBottomLeft,
  onResizeTop,
  onResizeBottom,
  onResizeLeft,
  onResizeRight,
}: InteractiveCropBoxProps) {
  const dragTypeRef = useRef<'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r' | null>(null);

  const handleTouchStart = (type: 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r', e: any) => {
    dragTypeRef.current = type;
    if (type === 'move') {
      onCropDragStart(e, scaleX, scaleY);
    } else {
      onResizeStart(e, scaleX, scaleY);
    }
  };

  const handleTouchMove = (e: any) => {
    if (!dragTypeRef.current) return;

    switch (dragTypeRef.current) {
      case 'move':
        onCropDrag(e, scaleX, scaleY);
        break;
      case 'tl':
        onResizeTopLeft(e, scaleX, scaleY);
        break;
      case 'tr':
        onResizeTopRight(e, scaleX, scaleY);
        break;
      case 'bl':
        onResizeBottomLeft(e, scaleX, scaleY);
        break;
      case 'br':
        onResizeBottomRight(e, scaleX, scaleY);
        break;
      case 't':
        onResizeTop(e, scaleX, scaleY);
        break;
      case 'b':
        onResizeBottom(e, scaleX, scaleY);
        break;
      case 'l':
        onResizeLeft(e, scaleX, scaleY);
        break;
      case 'r':
        onResizeRight(e, scaleX, scaleY);
        break;
    }
  };

  const handleTouchEnd = () => {
    dragTypeRef.current = null;
  };

  return (
    <View
      style={[
        styles.cropBoxOverlay,
        {
          left: cropRegion.x * scaleX,
          top: cropRegion.y * scaleY,
          width: cropRegion.width * scaleX,
          height: cropRegion.height * scaleY,
        },
      ]}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* White border - draggable area */}
      <View
        style={styles.cropBoxBorder}
        onTouchStart={(e) => handleTouchStart('move', e)}
      />

      {/* Corner resize handles */}
      <TouchableOpacity
        style={[styles.resizeHandle, { top: -6, left: -6 }]}
        onPressIn={(e) => handleTouchStart('tl', e)}
        activeOpacity={1}
      />
      <TouchableOpacity
        style={[styles.resizeHandle, { top: -6, right: -6 }]}
        onPressIn={(e) => handleTouchStart('tr', e)}
        activeOpacity={1}
      />
      <TouchableOpacity
        style={[styles.resizeHandle, { bottom: -6, left: -6 }]}
        onPressIn={(e) => handleTouchStart('bl', e)}
        activeOpacity={1}
      />
      <TouchableOpacity
        style={[styles.resizeHandle, { bottom: -6, right: -6 }]}
        onPressIn={(e) => handleTouchStart('br', e)}
        activeOpacity={1}
      />

      {/* Edge resize handles */}
      <TouchableOpacity
        style={[styles.edgeHandle, styles.topEdge]}
        onPressIn={(e) => handleTouchStart('t', e)}
        activeOpacity={1}
      />
      <TouchableOpacity
        style={[styles.edgeHandle, styles.bottomEdge]}
        onPressIn={(e) => handleTouchStart('b', e)}
        activeOpacity={1}
      />
      <TouchableOpacity
        style={[styles.edgeHandle, styles.leftEdge]}
        onPressIn={(e) => handleTouchStart('l', e)}
        activeOpacity={1}
      />
      <TouchableOpacity
        style={[styles.edgeHandle, styles.rightEdge]}
        onPressIn={(e) => handleTouchStart('r', e)}
        activeOpacity={1}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraWrapper: {
    flex: 1,
    margin: 0,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loadingText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT / 2,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  brandEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraStatus: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cameraStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  centerContent: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  cameraControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    zIndex: 10,
  },
  flipButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  flashButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  footerWrapper: {
    position: 'relative',
    backgroundColor: '#000000',
    paddingTop: 1,
  },
  whiteTopBorder: {
    position: 'absolute',
    top: 2,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  footerContent: {
    backgroundColor: '#000000',
    paddingTop: 6,
    paddingBottom: 6,
  },
  captureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  iconButton: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    opacity: 1,
  },
  outerRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5FA8A8',
  },
  bottomNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  navItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  cameraNavItem: {
    position: 'relative',
    alignItems: 'center',
  },
  cameraIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  cameraIconBackground: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 40,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  cropBoxContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cropBoxWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#000000',
  },
  darkOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  cropBoxOverlay: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  cropBoxBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  resizeHandle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  edgeHandle: {
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  topEdge: {
    top: -8,
    left: 20,
    right: 20,
    height: 16,
  },
  bottomEdge: {
    bottom: -8,
    left: 20,
    right: 20,
    height: 16,
  },
  leftEdge: {
    left: -8,
    top: 20,
    bottom: 20,
    width: 16,
  },
  rightEdge: {
    right: -8,
    top: 20,
    bottom: 20,
    width: 16,
  },
  cropActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 40,
    width: '100%',
  },
  cropCancelButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cropConfirmButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cropButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});