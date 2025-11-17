import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function CameraLandingScreen() {
  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraType, setCameraType] = useState<CameraType>('back');

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
      Alert.alert('Success', 'Picture captured successfully!');
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

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
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
      </CameraView>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  footerWrapper: {
    position: 'relative',
    backgroundColor: '#000000',
    paddingTop: 1,
  },
  whiteTopBorder: {
    position: 'absolute',
    top: -19,
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
});