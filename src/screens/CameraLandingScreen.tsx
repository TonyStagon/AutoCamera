import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Camera as ExpoCamera, useCameraPermissions } from 'expo-camera';

const SCREEN_HEIGHT = Dimensions.get('window').height;

// Fallback camera component for web
const CameraFallback = React.forwardRef<View, any>((props: any, ref) => (
  <View style={[props.style, { backgroundColor: '#1a1a1a' }]} ref={ref}>
    {props.children}
  </View>
));

export default function CameraLandingScreen() {
  const cameraRef = useRef<any>(null);
  const [permission, setPermission] = useState<any>(null);
  const [cameraComponent, setCameraComponent] = useState<any>(CameraFallback);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use the actual expo-camera permissions hook
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    let isMounted = true;
    
    const initCamera = async () => {
      try {
        console.log('Initializing camera...');
        
        // Check if we're on web platform (camera doesn't work on web)
        if (Platform.OS === 'web') {
          console.warn('Camera not supported on web platform');
          if (isMounted) {
            setIsCameraActive(false);
            setCameraError('Camera not supported on web browsers. Please use a mobile device.');
            setPermission({
              permission: { granted: true },
              requestPermission: () => {}
            });
          }
          return;
        }
        
        // Check if ExpoCamera is available
        if (ExpoCamera && typeof ExpoCamera === 'function') {
          console.log('Expo Camera component is available');
          setCameraComponent(() => ExpoCamera);
          setIsCameraActive(true);
        } else {
          console.warn('Expo Camera component not available, using fallback');
          setIsCameraActive(false);
          setCameraError('Camera component not found. Check if expo-camera is properly installed.');
        }
        
        // Set up permissions using the actual hook
        if (isMounted && cameraPermission) {
          setPermission({
            permission: cameraPermission,
            requestPermission: requestCameraPermission
          });
        }
        
      } catch (error) {
        console.error('Failed to initialize camera:', error);
        if (isMounted) {
          console.log('Using fallback due to initialization error');
          setIsCameraActive(false);
          setCameraError(`Camera initialization failed: ${error instanceof Error ? error.message : String(error)}`);
          setPermission({
            permission: { granted: true },
            requestPermission: () => {}
          });
        }
      }
    };

    // Add a small delay to ensure React Native is fully initialized
    const initTimer = setTimeout(() => {
      initCamera();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(initTimer);
    };
  }, [retryCount, cameraPermission, requestCameraPermission]);

  const retryCamera = () => {
    console.log('Retrying camera initialization...');
    setRetryCount(prev => prev + 1);
    setCameraError(null);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  const { permission: perm, requestPermission } = permission;

  if (!perm?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          We need camera permission to continue
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const Camera = cameraComponent;

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        {/* @ts-ignore - Expo Camera TypeScript issues */}
        <Camera ref={cameraRef} style={styles.camera}>
          <View style={styles.topBar}>
            <View style={styles.brandContainer}>
              <Text style={styles.brandEmoji}>🎁</Text>
              <Text style={styles.brandText}>Get pro</Text>
            </View>
            
            {/* Camera status indicator */}
            {!isCameraActive && (
              <View style={styles.cameraStatusContainer}>
                <View style={styles.cameraStatus}>
                  <Ionicons name="warning-outline" size={16} color="#FF9500" />
                  <Text style={styles.cameraStatusText}>Camera not available</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.centerContent}>
            <Text style={styles.instructionText}>
              Take a pic and get{'\n'}an answer
            </Text>
            
            {/* Show fallback message when camera is not active */}
            {!isCameraActive && (
              <View style={styles.fallbackMessage}>
                <Ionicons name="camera-outline" size={48} color="#FFFFFF" />
                <Text style={styles.fallbackText}>
                  Camera preview not available{'\n'}
                  You can still take photos
                </Text>
                {cameraError && (
                  <Text style={styles.errorText}>
                    {cameraError}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={retryCamera}
                >
                  <Text style={styles.retryButtonText}>
                    Retry Camera
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Camera>
      </View>

      <View style={styles.footerWrapper}>
        <View style={styles.whiteTopBorder} />

        <View style={styles.footerContent}>
          <View style={styles.captureContainer}>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <View style={styles.iconButtonInner}>
                <Ionicons name="images-outline" size={28} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.7}>
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
  permissionText: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 20,
    marginTop: SCREEN_HEIGHT / 2 - 50,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
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
  cameraStatusContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: 20,
    zIndex: 20,
  },
  cameraStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.5)',
  },
  cameraStatusText: {
    color: '#FF9500',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  fallbackMessage: {
    alignItems: 'center',
    marginTop: 20,
  },
  fallbackText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});