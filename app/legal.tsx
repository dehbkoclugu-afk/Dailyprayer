import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { fonts, type } from '@/theme/typography';
import { spacing, TAP_MIN } from '@/theme/tokens';
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from '@/data/legal';

/**
 * Minimal Markdown renderer for our own controlled legal copy (headings, bold,
 * list items, paragraphs). Not a general-purpose parser — just what legal.ts uses.
 */
function Markdown({ source }: { source: string }) {
  const t = useTheme();
  const blocks = source.trim().split('\n');
  return (
    <View>
      {blocks.map((line, i) => {
        const key = `${i}`;
        if (line.startsWith('## ')) {
          return (
            <Text
              key={key}
              style={{ ...type.bodySemi, color: t.ink, marginTop: spacing.xl, marginBottom: spacing.sm }}
            >
              {line.slice(3)}
            </Text>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <Text key={key} style={{ ...type.title, color: t.ink, marginBottom: spacing.sm }}>
              {line.slice(2)}
            </Text>
          );
        }
        if (line.startsWith('_') && line.endsWith('_')) {
          return (
            <Text key={key} style={{ ...type.label, color: t.inkFaint, marginBottom: spacing.md }}>
              {line.slice(1, -1)}
            </Text>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <View key={key} style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: 6 }}>
              <Text style={{ ...type.callout, color: t.goldText }}>•</Text>
              <Text style={{ ...type.callout, lineHeight: 23, color: t.ink, flex: 1 }}>
                {renderInline(line.slice(2))}
              </Text>
            </View>
          );
        }
        if (line.trim() === '') return <View key={key} style={{ height: spacing.sm }} />;
        return (
          <Text key={key} style={{ ...type.callout, lineHeight: 23, color: t.ink, marginBottom: 6 }}>
            {renderInline(line)}
          </Text>
        );
      })}
    </View>
  );

  function renderInline(text: string) {
    // bold **...**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith('**') && p.endsWith('**') ? (
        <Text key={i} style={{ fontFamily: fonts.sansSemiBold }}>
          {p.slice(2, -2)}
        </Text>
      ) : (
        <Text key={i}>{p}</Text>
      ),
    );
  }
}

export default function Legal() {
  const t = useTheme();
  const { t: tr } = useT();
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const source = doc === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY;

  return (
    <Screen>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={tr('a11y.back')}
        style={({ pressed }) => ({ width: TAP_MIN, height: TAP_MIN, justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
      >
        <Ionicons name="chevron-back" size={26} color={t.inkSoft} />
      </Pressable>
      <Markdown source={source} />
    </Screen>
  );
}
