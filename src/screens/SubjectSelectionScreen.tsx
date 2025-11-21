import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface SubjectSelectionScreenProps {
  croppedImageUri: string;
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
  croppedImageUri,
  onBack,
  onSubjectSelect,
}: SubjectSelectionScreenProps) {
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

      {/* Preview Image */}
      <View style={styles.previewContainer}>
        <View style={styles.previewWrapper}>
          <Image 
            source={{ uri: croppedImageUri }} 
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
        
        {/* App branding */}
        <View style={styles.appBranding}>
          <View style={styles.appIcon}>
            <Text style={styles.appIconText}>📱</Text>
          </View>
          <Text style={styles.appName}>slate</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.handleBar} />
        
        <View style={styles.sheetContent}>
          <Text style={styles.questionTitle}>What is the question{'\n'}related to?</Text>
          
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
      </View>
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
    paddingHorizontal: 20,
  },
  previewWrapper: {
    width: SCREEN_WIDTH - 40,
    height: 250,
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  appBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  appIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconText: {
    fontSize: 18,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 1,
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