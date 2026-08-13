import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/hooks/useTheme';
import { useT } from '@/i18n';
import { type as ty } from '@/theme/typography';
import { spacing } from '@/theme/tokens';
import { PRIVACY_POLICY, TERMS_OF_SERVICE } from '@/data/legal';
import { TopAppBar } from '@/components/TopAppBar';

/**
 * Minimal Markdown renderer for our own controlled legal copy (headings, bold,
 * list items, paragraphs). Not a general-purpose parser , just what legal.ts uses.
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
              style={{ ...ty.bodyLargeStrong, color: t.ink, marginTop: spacing.xl, marginBottom: spacing.sm }}
            >
              {line.slice(3)}
            </Text>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <Text key={key} style={{ ...ty.title, color: t.ink, marginBottom: spacing.sm }}>
              {line.slice(2)}
            </Text>
          );
        }
        if (line.startsWith('_') && line.endsWith('_')) {
          return (
            <Text key={key} style={{ ...ty.captionRegular, color: t.inkFaint, marginBottom: spacing.md }}>
              {line.slice(1, -1)}
            </Text>
          );
        }
        if (line.startsWith('- ')) {
          return (
            <View key={key} style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: 6 }}>
              <Text style={{ ...ty.secondary, color: t.gold }}>•</Text>
              <Text style={{ ...ty.secondaryComfortable, color: t.ink, flex: 1 }}>
                {renderInline(line.slice(2))}
              </Text>
            </View>
          );
        }
        if (line.trim() === '') return <View key={key} style={{ height: spacing.sm }} />;
        return (
          <Text key={key} style={{ ...ty.secondaryComfortable, color: t.ink, marginBottom: 6 }}>
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
        <Text key={i} style={ty.label}>
          {p.slice(2, -2)}
        </Text>
      ) : (
        <Text key={i}>{p}</Text>
      ),
    );
  }
}

export default function Legal() {
  const { t: tr } = useT();
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const source = (doc === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY).replace(/^# .+\n/, '');

  return (
    <Screen>
      <TopAppBar title={doc === 'terms' ? tr('profile.terms') : tr('profile.privacy')} />
      <Markdown source={source} />
    </Screen>
  );
}
