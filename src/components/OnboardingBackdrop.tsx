import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useArtwork } from '@/hooks/useArtwork';

/** Quiet, full-screen atmosphere shared by the conversational onboarding flow. */
export function OnboardingBackdrop() {
  const dawn = useArtwork().scheme === 'dawn';

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: -120, right: -24, bottom: -120, left: -24 }}
    >
      <LinearGradient
        colors={
          dawn
            ? ['#FFF8E9', '#FBF7F0', '#F4E8D8']
            : ['#17172B', '#0E1220', '#151B31']
        }
        locations={[0, 0.48, 1]}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <View
        style={{
          position: 'absolute',
          top: 34,
          right: -76,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: dawn ? 'rgba(226,176,74,0.17)' : 'rgba(217,164,65,0.10)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 70,
          left: -92,
          width: 230,
          height: 230,
          borderRadius: 115,
          backgroundColor: dawn ? 'rgba(117,91,151,0.08)' : 'rgba(96,110,180,0.09)',
        }}
      />
    </View>
  );
}
