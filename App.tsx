import React from 'react';
import { StatusBar } from 'expo-status-bar';
import CameraLandingScreen from './src/screens/CameraLandingScreen';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <CameraLandingScreen />
    </>
  );
}