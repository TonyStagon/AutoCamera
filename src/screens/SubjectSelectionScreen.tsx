import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SubjectSelectionScreenProps {
  imageUri: string;
  imageWidth: number;
  imageHeight: number;
  cropRegion: CropRegion;
  onBack: () => void;
  onSubjectSelect: (subject: string) => void;
}

const SUBJECTS = [
  { id: 'math', label: 'Math' },
  { id: 'biology', label: 'Biology' },
  { id: 'physics', label: 'Physics' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'history', label: 'History' },
  { id: 'geography', label: 'Geography' },
];

export default function SubjectSelectionScreen({
  imageUri,
  imageWidth,
  imageHeight,
  cropRegion,
  onBack,
  onSubjectSelect,
}: SubjectSelectionScreenProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const sheetHeight = useRef(SCREEN_HEIGHT * 0.5).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // Swipe down detected - go back to crop page
          Animated.timing(translateY, {
            toValue: sheetHeight,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            onBack();
          });
        } else {
          // Return to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  // Calculate display dimensions to fill the screen
  const maxWidth = SCREEN_WIDTH;
  const maxHeight = SCREEN_HEIGHT * 0.7; // Use 70% of screen height for image
  
  let displayWidth = maxWidth;
  let displayHeight = (imageHeight / imageWidth) * displayWidth;
  
  if (displayHeight > maxHeight) {
    displayHeight = maxHeight;
    displayWidth = (imageWidth / imageHeight) * displayHeight;
  }

  const scaleX = displayWidth / imageWidth;
  const scaleY = displayHeight / imageHeight;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subject selection</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Preview Image with Crop Box - Full Screen */}
      <View style={styles.previewContainer}>
        <View style={[styles.previewWrapper, { width: displayWidth, height: displayHeight }]}>
          <Image
            source={{ uri: imageUri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
          
          {/* Dark overlays outside crop box */}
          <View style={[styles.darkOverlay, { top: 0, left: 0, right: 0, height: cropRegion.y * scaleY }]} />
          <View style={[styles.darkOverlay, { bottom: 0, left: 0, right: 0, height: (imageHeight - cropRegion.y - cropRegion.height) * scaleY }]} />
          <View style={[styles.darkOverlay, { top: cropRegion.y * scaleY, left: 0, width: cropRegion.x * scaleX, height: cropRegion.height * scaleY }]} />
          <View style={[styles.darkOverlay, { top: cropRegion.y * scaleY, right: 0, width: (imageWidth - cropRegion.x - cropRegion.width) * scaleX, height: cropRegion.height * scaleY }]} />
          
          {/* Crop box overlay */}
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
          >
            <View style={styles.cropBoxBorder} />
            
            {/* Corner indicators */}
            <View style={[styles.cornerIndicator, { top: -3, left: -3 }]}>
              <View style={styles.cornerTopLeft} />
            </View>
            <View style={[styles.cornerIndicator, { top: -3, right: -3 }]}>
              <View style={styles.cornerTopRight} />
            </View>
            <View style={[styles.cornerIndicator, { bottom: -3, left: -3 }]}>
              <View style={styles.cornerBottomLeft} />
            </View>
            <View style={[styles.cornerIndicator, { bottom: -3, right: -3 }]}>
              <View style={styles.cornerBottomRight} />
            </View>
          </View>
        </View>
        
      </View>

      {/* Bottom Sheet with Swipe Down */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.handleBar} />
        
        <View style={styles.sheetContent}>
          <ScrollView 
            style={styles.subjectList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.subjectListContent}
          >
            {SUBJECTS.map((subject) => (
              <TouchableOpacity
                key={subject.id}
                style={styles.subjectButton}
                onPress={() => onSubjectSelect(subject.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.subjectLabel}>{subject.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '500',
  },
  placeholder: {
    width: 40,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewWrapper: {
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  cropBoxOverlay: {
    position: 'absolute',
  },
  cropBoxBorder: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  cornerIndicator: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTopLeft: {
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFFFFF',
    borderBottomRightRadius: 8,
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: '50%',
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#C7C7CC',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  questionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 32,
  },
  subjectList: {
    maxHeight: 300,
  },
  subjectListContent: {
    gap: 12,
  },
  subjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  subjectLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
});