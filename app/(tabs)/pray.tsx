import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { useTheme } from '@/hooks/useTheme';
import { fonts, type as ty } from '@/theme/typography';
import { radius, spacing } from '@/theme/tokens';
import { prayers, prayerCategories, type GuidedPrayer } from '@/data/prayers';
import { useEntitlementStore } from '@/state/useEntitlementStore';

export default function Pray() {
  const t = useTheme();
  const isPlus = useEntitlementStore((s) => s.isPlus);
  const [cat, setCat] = useState<GuidedPrayer['category'] | 'all'>('all');
  const list = cat === 'all' ? prayers : prayers.filter((p) => p.category === cat);

  const open = (p: GuidedPrayer) => {
    if (p.plus && !isPlus) router.push('/paywall');
    else router.push({ pathname: '/player', params: { id: p.id } });
  };

  return (
    <Screen tabbed>
      <Text style={[ty.title, { color: t.ink }]}>Pray</Text>
      <Text style={[ty.secondary, { color: t.inkSoft, marginTop: spacing.xs }]}>
        Guided prayers for every season
      </Text>

      {/* category chips */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg }}>
        <Chip label="All" icon="apps-outline" active={cat === 'all'} onPress={() => setCat('all')} />
        {prayerCategories.map((c) => (
          <Chip
            key={c.key}
            label={c.label}
            icon={c.icon}
            active={cat === c.key}
            onPress={() => setCat(c.key)}
          />
        ))}
      </View>

      <SectionHeader title={cat === 'all' ? 'Library' : prayerCategories.find((c) => c.key === cat)?.label ?? ''} />
      <View style={{ gap: spacing.md }}>
        {list.map((p) => {
          const locked = p.plus && !isPlus;
          return (
            <Pressable
              key={p.id}
              onPress={() => open(p)}
              accessibilityRole="button"
              accessibilityLabel={`${p.title}, ${p.minutes} minutes${locked ? ', requires Plus' : ''}`}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.lg,
                backgroundColor: t.surface,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: t.border,
                padding: spacing.lg,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: t.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={locked ? 'lock-closed-outline' : 'play'}
                  size={20}
                  color={locked ? t.inkFaint : t.gold}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.sansSemiBold, fontSize: 16, color: t.ink }}>{p.title}</Text>
                <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: t.inkSoft, marginTop: 2 }}>
                  {p.minutes} min · {prayerCategories.find((c) => c.key === p.category)?.label}
                </Text>
              </View>
              {p.plus ? (
                <View
                  style={{
                    backgroundColor: locked ? t.surfaceAlt : t.goldSoft,
                    borderRadius: radius.pill,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ fontFamily: fonts.sansBold, fontSize: 10, color: locked ? t.inkFaint : t.gold }}>
                    PLUS
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

function Chip({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: active ? t.goldSoft : t.surface,
        borderColor: active ? t.gold : t.border,
        borderWidth: 1,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.lg,
        minHeight: 44,
      }}
    >
      <Ionicons name={icon as never} size={16} color={active ? t.gold : t.inkSoft} />
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: active ? t.gold : t.inkSoft }}>
        {label}
      </Text>
    </Pressable>
  );
}
