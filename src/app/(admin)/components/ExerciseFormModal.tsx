import { colors, radius, spacing, typography } from '@/constants/theme';
import { createExercise, updateExercise } from '@/lib/exercise';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Toast, { ToastShowParams } from 'react-native-toast-message';

type Props = {
  exercise?: Exercise | null;
  close(): void;
  onSaved(exercise: Exercise): void;
};

type Mode = 'form' | 'json';

const LANDMARKS: LandmarkKey[] = [
  'leftShoulderPosition',
  'leftElbowPosition',
  'leftWristPosition',
  'rightShoulderPosition',
  'rightElbowPosition',
  'rightWristPosition',
  'leftHipPosition',
  'rightHipPosition',
  'leftKneePosition',
  'rightKneePosition',
  'leftAnklePosition',
  'rightAnklePosition',
  'nosePosition',
  'leftEyePosition',
  'rightEyePosition',
  'leftEarPosition',
  'rightEarPosition',
  'leftMouthPosition',
  'rightMouthPosition',
  'leftIndexPosition',
  'rightIndexPosition',
  'leftPinkyPosition',
  'rightPinkyPosition',
  'leftThumbPosition',
  'rightThumbPosition',
  'leftFootIndexPosition',
  'rightFootIndexPosition',
  'leftHeelPosition',
  'rightHeelPosition',
];

type TriggerEntry = {
  label: string;
  a: LandmarkKey;
  b: LandmarkKey;
  c: LandmarkKey;
  targetAngle: string;
  targetDirection: 'above' | 'below';
  resetAngle: string;
  resetDirection: 'above' | 'below';
};

function buildInitialTriggers(exercise?: Exercise | null): TriggerEntry[] {
  if (!exercise || !exercise.repTriggers?.length) {
    return [
      {
        label: '',
        a: 'leftShoulderPosition',
        b: 'leftElbowPosition',
        c: 'leftWristPosition',
        targetAngle: '60',
        targetDirection: 'below',
        resetAngle: '150',
        resetDirection: 'above',
      },
    ];
  }
  return exercise.repTriggers.map((t, i) => ({
    label: exercise.angleChecks?.[i]?.label ?? '',
    a: t.a,
    b: t.b,
    c: t.c,
    targetAngle: String(t.targetAngle),
    targetDirection: t.targetDirection,
    resetAngle: String(t.resetAngle),
    resetDirection: t.resetDirection,
  }));
}

function LandmarkPicker({
  value,
  onChange,
  label,
}: {
  value: LandmarkKey;
  onChange: (v: LandmarkKey) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable style={styles.pickerBtn} onPress={() => setOpen(true)}>
        <Text style={styles.pickerLabel}>{label}</Text>
        <View style={styles.pickerValueRow}>
          <Text style={styles.pickerValue}>{value || 'Select landmark'}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.textGrey} />
        </View>
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.pickerSheet} onPress={() => { }}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerSheetTitle}>Select Landmark Point</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <Ionicons name="close-circle" size={22} color={colors.textGrey} />
              </Pressable>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              {LANDMARKS.map((lm) => {
                const isSelected = value === lm;
                return (
                  <Pressable
                    key={lm}
                    style={[styles.pickerOption, isSelected && styles.pickerOptionSelected]}
                    onPress={() => {
                      onChange(lm);
                      setOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        isSelected && styles.pickerOptionTextSelected,
                      ]}
                    >
                      {lm}
                    </Text>
                    {isSelected && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export default function ExerciseFormModal({ exercise, close, onSaved }: Props) {
  const isEdit = !!exercise;


  const showModalToast = (params: ToastShowParams) => {
    Toast.show(params);
  };

  const [mode, setMode] = useState<Mode>('form');

  // Form State
  const [name, setName] = useState(exercise?.name ?? '');
  const [description, setDescription] = useState(exercise?.description ?? '');
  const [instructions, setInstructions] = useState(exercise?.instructions ?? '');
  const [cameraOrientation, setCameraOrientation] = useState<'front' | 'side'>(
    exercise?.cameraOrientation ?? 'side',
  );
  const [cameraOrientationTip, setCameraOrientationTip] = useState(
    exercise?.cameraOrientationTip ?? '',
  );
  const [targetReps, setTargetReps] = useState(String(exercise?.targetReps ?? 5));
  const [holdSeconds, setHoldSeconds] = useState(String(exercise?.holdSeconds ?? 1));

  const [media, setMedia] = useState<ExerciseMedia[]>(exercise?.media ?? []);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCaption, setNewMediaCaption] = useState('');

  const [triggers, setTriggers] = useState<TriggerEntry[]>(buildInitialTriggers(exercise));
  const [combinator, setCombinator] = useState<'all' | 'any'>(
    exercise?.repTriggerCombinator ?? 'all',
  );

  const [rest, setRest] = useState(exercise?.repStateInstructions?.rest ?? '');
  const [triggered, setTriggered] = useState(exercise?.repStateInstructions?.triggered ?? '');
  const [holding, setHolding] = useState(exercise?.repStateInstructions?.holding ?? '');
  const [returning, setReturning] = useState(exercise?.repStateInstructions?.returning ?? '');

  const [fullJsonStr, setFullJsonStr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const compilePayload = (): CreateExercisePayload => ({
    name: name.trim(),
    description: description.trim(),
    instructions: instructions.trim(),
    cameraOrientation,
    cameraOrientationTip: cameraOrientationTip.trim(),
    targetReps: Number(targetReps) || 1,
    holdSeconds: Number(holdSeconds) || 0,
    media,
    angleChecks: triggers.map((t) => ({ label: t.label || 'Angle', a: t.a, b: t.b, c: t.c })),
    repTriggers: triggers.map((t) => ({
      a: t.a,
      b: t.b,
      c: t.c,
      targetAngle: Number(t.targetAngle) || 0,
      targetDirection: t.targetDirection,
      resetAngle: Number(t.resetAngle) || 0,
      resetDirection: t.resetDirection,
    })),
    repTriggerCombinator: combinator,
    repStateInstructions: { rest, triggered, holding, returning },
  });

  const switchToJson = () => {
    const payload = compilePayload();
    setFullJsonStr(JSON.stringify(payload, null, 2));
    setMode('json');
  };

  const switchToForm = () => {
    try {
      const parsed = JSON.parse(fullJsonStr);
      setName(parsed.name ?? '');
      setDescription(parsed.description ?? '');
      setInstructions(parsed.instructions ?? '');
      setCameraOrientation(parsed.cameraOrientation ?? 'side');
      setCameraOrientationTip(parsed.cameraOrientationTip ?? '');
      setTargetReps(String(parsed.targetReps ?? 5));
      setHoldSeconds(String(parsed.holdSeconds ?? 1));
      setMedia(parsed.media ?? []);

      const parsedTriggers: TriggerEntry[] = (parsed.repTriggers ?? []).map(
        (t: any, i: number) => ({
          label: parsed.angleChecks?.[i]?.label ?? '',
          a: t.a,
          b: t.b,
          c: t.c,
          targetAngle: String(t.targetAngle ?? ''),
          targetDirection: t.targetDirection ?? 'below',
          resetAngle: String(t.resetAngle ?? ''),
          resetDirection: t.resetDirection ?? 'above',
        }),
      );
      if (parsedTriggers.length > 0) setTriggers(parsedTriggers);
      setCombinator(parsed.repTriggerCombinator ?? 'all');
      setRest(parsed.repStateInstructions?.rest ?? '');
      setTriggered(parsed.repStateInstructions?.triggered ?? '');
      setHolding(parsed.repStateInstructions?.holding ?? '');
      setReturning(parsed.repStateInstructions?.returning ?? '');

      setMode('form');
    } catch {
      showModalToast({
        type: 'error',
        text1: 'Invalid JSON',
        text2: 'Fix syntax errors before switching back to Form view',
      });
    }
  };

  const updateTrigger = (index: number, patch: Partial<TriggerEntry>) => {
    setTriggers((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  };

  const addTrigger = () => {
    setTriggers((prev) => [
      ...prev,
      {
        label: '',
        a: 'leftHipPosition',
        b: 'leftKneePosition',
        c: 'leftAnklePosition',
        targetAngle: '110',
        targetDirection: 'below',
        resetAngle: '160',
        resetDirection: 'above',
      },
    ]);
  };

  const removeTrigger = (index: number) => {
    setTriggers((prev) => prev.filter((_, i) => i !== index));
  };

  const addMedia = () => {
    if (!newMediaUrl.trim()) return;
    setMedia((prev) => [
      ...prev,
      { url: newMediaUrl.trim(), caption: newMediaCaption.trim() || undefined, type: 'image' },
    ]);
    setNewMediaUrl('');
    setNewMediaCaption('');
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    let payload: CreateExercisePayload;

    if (mode === 'json') {
      try {
        payload = JSON.parse(fullJsonStr);
      } catch {
        showModalToast({
          type: 'error',
          text1: 'Invalid JSON',
          text2: 'Please fix the JSON formatting before submitting',
        });
        return;
      }
    } else {
      payload = compilePayload();
    }

    if (!payload.name || !payload.description || !payload.instructions) {
      showModalToast({ type: 'error', text1: 'Fill in all required fields' });
      return;
    }

    setSubmitting(true);
    try {
      const saved = isEdit
        ? await updateExercise(exercise!._id, payload)
        : await createExercise(payload);

      onSaved(saved);
      close();

      // Show toast on root level after modal closes
      setTimeout(() => {
        Toast.show({
          type: 'success',
          text1: isEdit ? 'Exercise updated' : 'Exercise created',
        });
      }, 150);
    } catch (e: any) {
      showModalToast({ type: 'error', text1: 'Save failed', text2: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent statusBarTranslucent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.overlay} onPress={close}>
          <Pressable style={styles.card} onPress={() => { }}>
            {/* Modal Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{isEdit ? 'Edit Exercise' : 'New Exercise'}</Text>
                <Text style={styles.headerSub}>
                  {mode === 'form' ? 'Configure form parameters' : 'Full exercise JSON definition'}
                </Text>
              </View>
              <Pressable onPress={close} hitSlop={8} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={colors.textGrey} />
              </Pressable>
            </View>

            {/* Mode Selector */}
            <View style={styles.segmentedControl}>
              <Pressable
                style={[styles.segmentBtn, mode === 'form' && styles.segmentBtnActive]}
                onPress={() => (mode === 'json' ? switchToForm() : setMode('form'))}
              >
                <Ionicons
                  name="options-outline"
                  size={14}
                  color={mode === 'form' ? colors.textDark : colors.textGrey}
                />
                <Text style={[styles.segmentText, mode === 'form' && styles.segmentTextActive]}>
                  Form View
                </Text>
              </Pressable>
              <Pressable
                style={[styles.segmentBtn, mode === 'json' && styles.segmentBtnActive]}
                onPress={() => (mode === 'form' ? switchToJson() : setMode('json'))}
              >
                <Ionicons
                  name="code-slash-outline"
                  size={14}
                  color={mode === 'json' ? colors.textDark : colors.textGrey}
                />
                <Text style={[styles.segmentText, mode === 'json' && styles.segmentTextActive]}>
                  Full JSON
                </Text>
              </Pressable>
            </View>

            {/* Content Body */}
            {mode === 'form' ? (
              <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
              >
                {/* General Info */}
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                  <Text style={styles.sectionTitle}>General Information</Text>
                </View>

                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Left Bicep Curl"
                  placeholderTextColor={colors.textGrey}
                />

                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  placeholder="Short summary of exercise focus"
                  placeholderTextColor={colors.textGrey}
                />

                <Text style={styles.label}>Instructions *</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={instructions}
                  onChangeText={setInstructions}
                  multiline
                  placeholder="Step-by-step guidance"
                  placeholderTextColor={colors.textGrey}
                />

                {/* Camera & Goals */}
                <View style={[styles.sectionHeader, { marginTop: spacing.sm }]}>
                  <Ionicons name="videocam-outline" size={16} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Camera & Goals</Text>
                </View>

                <Text style={styles.label}>Camera Orientation</Text>
                <View style={styles.segmentedControl}>
                  {(['front', 'side'] as const).map((o) => (
                    <Pressable
                      key={o}
                      style={[
                        styles.segmentBtn,
                        cameraOrientation === o && styles.segmentBtnActive,
                      ]}
                      onPress={() => setCameraOrientation(o)}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          cameraOrientation === o && styles.segmentTextActive,
                        ]}
                      >
                        {o}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={styles.label}>Camera Positioning Tip</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={cameraOrientationTip}
                  onChangeText={setCameraOrientationTip}
                  multiline
                  placeholder="e.g. Place phone at hip height 6ft away"
                  placeholderTextColor={colors.textGrey}
                />

                <View style={styles.row}>
                  <View style={styles.half}>
                    <Text style={styles.label}>Target Reps</Text>
                    <TextInput
                      style={styles.input}
                      value={targetReps}
                      onChangeText={setTargetReps}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={styles.half}>
                    <Text style={styles.label}>Hold Seconds</Text>
                    <TextInput
                      style={styles.input}
                      value={holdSeconds}
                      onChangeText={setHoldSeconds}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                {/* Media Assets */}
                <View style={[styles.sectionHeader, { marginTop: spacing.sm }]}>
                  <Ionicons name="images-outline" size={16} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Media Assets</Text>
                </View>

                {media.map((m, i) => (
                  <View key={i} style={styles.mediaCard}>
                    <Ionicons name="image-outline" size={20} color={colors.textGrey} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.mediaText} numberOfLines={1}>
                        {m.url}
                      </Text>
                      {m.caption ? <Text style={styles.mediaCaption}>{m.caption}</Text> : null}
                    </View>
                    <Pressable onPress={() => removeMedia(i)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </Pressable>
                  </View>
                ))}

                <TextInput
                  style={styles.input}
                  value={newMediaUrl}
                  onChangeText={setNewMediaUrl}
                  placeholder="Image or Video URL"
                  placeholderTextColor={colors.textGrey}
                />
                <TextInput
                  style={styles.input}
                  value={newMediaCaption}
                  onChangeText={setNewMediaCaption}
                  placeholder="Caption (optional)"
                  placeholderTextColor={colors.textGrey}
                />

                <View style={styles.mediaActions}>
                  <Pressable style={styles.mediaAddBtn} onPress={addMedia}>
                    <Ionicons name="add" size={16} color={colors.textDark} />
                    <Text style={styles.mediaAddBtnText}>Add URL</Text>
                  </Pressable>
                  <Pressable
                    style={styles.mediaUploadBtn}
                    onPress={() => showModalToast({ type: 'info', text1: 'Upload coming soon' })}
                  >
                    <Ionicons name="cloud-upload-outline" size={16} color={colors.primary} />
                    <Text style={styles.mediaUploadBtnText}>Upload Media</Text>
                  </Pressable>
                </View>

                {/* Movement Tracking */}
                <View style={[styles.sectionHeader, { marginTop: spacing.md }]}>
                  <Ionicons name="analytics-outline" size={16} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Movement Tracking</Text>
                </View>

                {triggers.length > 1 && (
                  <>
                    <Text style={styles.label}>Trigger Condition Rule</Text>
                    <View style={styles.segmentedControl}>
                      {(['all', 'any'] as const).map((c) => (
                        <Pressable
                          key={c}
                          style={[styles.segmentBtn, combinator === c && styles.segmentBtnActive]}
                          onPress={() => setCombinator(c)}
                        >
                          <Text
                            style={[
                              styles.segmentText,
                              combinator === c && styles.segmentTextActive,
                            ]}
                          >
                            {c === 'all' ? 'All must match' : 'Any can match'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}

                {triggers.map((t, i) => (
                  <View key={i} style={styles.triggerCard}>
                    <View style={styles.triggerHeader}>
                      <Text style={styles.triggerTitle}>Condition #{i + 1}</Text>
                      {triggers.length > 1 && (
                        <Pressable onPress={() => removeTrigger(i)} hitSlop={8}>
                          <Ionicons name="trash-outline" size={16} color={colors.error} />
                        </Pressable>
                      )}
                    </View>

                    <Text style={styles.label}>Angle Label</Text>
                    <TextInput
                      style={styles.input}
                      value={t.label}
                      onChangeText={(v) => updateTrigger(i, { label: v })}
                      placeholder="e.g. Left Elbow Extension"
                      placeholderTextColor={colors.textGrey}
                    />

                    <LandmarkPicker
                      label="Point A (Origin)"
                      value={t.a}
                      onChange={(v) => updateTrigger(i, { a: v })}
                    />
                    <LandmarkPicker
                      label="Point B (Vertex Joint)"
                      value={t.b}
                      onChange={(v) => updateTrigger(i, { b: v })}
                    />
                    <LandmarkPicker
                      label="Point C (Terminal)"
                      value={t.c}
                      onChange={(v) => updateTrigger(i, { c: v })}
                    />

                    <View style={styles.row}>
                      <View style={styles.half}>
                        <Text style={styles.label}>Target Angle (°)</Text>
                        <TextInput
                          style={styles.input}
                          value={t.targetAngle}
                          onChangeText={(v) => updateTrigger(i, { targetAngle: v })}
                          keyboardType="number-pad"
                        />
                        <View style={[styles.segmentedControl, { marginTop: spacing.xs }]}>
                          {(['above', 'below'] as const).map((d) => (
                            <Pressable
                              key={d}
                              style={[
                                styles.segmentBtn,
                                t.targetDirection === d && styles.segmentBtnActive,
                              ]}
                              onPress={() => updateTrigger(i, { targetDirection: d })}
                            >
                              <Text
                                style={[
                                  styles.segmentText,
                                  t.targetDirection === d && styles.segmentTextActive,
                                ]}
                              >
                                {d}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      <View style={styles.half}>
                        <Text style={styles.label}>Reset Angle (°)</Text>
                        <TextInput
                          style={styles.input}
                          value={t.resetAngle}
                          onChangeText={(v) => updateTrigger(i, { resetAngle: v })}
                          keyboardType="number-pad"
                        />
                        <View style={[styles.segmentedControl, { marginTop: spacing.xs }]}>
                          {(['above', 'below'] as const).map((d) => (
                            <Pressable
                              key={d}
                              style={[
                                styles.segmentBtn,
                                t.resetDirection === d && styles.segmentBtnActive,
                              ]}
                              onPress={() => updateTrigger(i, { resetDirection: d })}
                            >
                              <Text
                                style={[
                                  styles.segmentText,
                                  t.resetDirection === d && styles.segmentTextActive,
                                ]}
                              >
                                {d}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                ))}

                <Pressable style={styles.addTriggerBtn} onPress={addTrigger}>
                  <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                  <Text style={styles.addTriggerText}>Add Joint Angle Condition</Text>
                </Pressable>

                <Text style={styles.label}>Phase Audio Prompts</Text>
                <TextInput
                  style={styles.input}
                  value={rest}
                  onChangeText={setRest}
                  placeholder="Rest phase prompt"
                  placeholderTextColor={colors.textGrey}
                />
                <TextInput
                  style={styles.input}
                  value={triggered}
                  onChangeText={setTriggered}
                  placeholder="Triggered prompt"
                  placeholderTextColor={colors.textGrey}
                />
                <TextInput
                  style={styles.input}
                  value={holding}
                  onChangeText={setHolding}
                  placeholder="Holding prompt"
                  placeholderTextColor={colors.textGrey}
                />
                <TextInput
                  style={styles.input}
                  value={returning}
                  onChangeText={setReturning}
                  placeholder="Return prompt"
                  placeholderTextColor={colors.textGrey}
                />
              </ScrollView>
            ) : (
              <ScrollView
                contentContainerStyle={{ paddingVertical: spacing.xs }}
                keyboardShouldPersistTaps="handled"
              >
                <TextInput
                  style={styles.jsonBox}
                  value={fullJsonStr}
                  onChangeText={setFullJsonStr}
                  multiline
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </ScrollView>
            )}

            {/* Submit CTA */}
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                submitting && styles.submitBtnDisabled,
                pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isEdit ? 'Save Changes' : 'Create Exercise'}
                </Text>
              )}
            </Pressable>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '88%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: '700',
    color: colors.textDark,
  },
  headerSub: {
    fontSize: typography.small,
    color: colors.textGrey,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  sectionTitle: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textGrey,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: colors.textDark,
  },
  multiline: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  jsonBox: {
    minHeight: 340,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    backgroundColor: '#1E1E1E',
    color: '#D4D4D4',
    padding: spacing.md,
    borderRadius: radius.md,
  },

  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  half: { flex: 1 },

  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.border + '50',
    borderRadius: radius.md,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md - 2,
  },
  segmentBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  segmentTextActive: {
    color: colors.textDark,
    fontWeight: '700',
  },

  mediaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  mediaText: {
    fontSize: typography.small,
    color: colors.textDark,
    fontWeight: '600',
  },
  mediaCaption: {
    fontSize: 11,
    color: colors.textGrey,
  },
  mediaActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mediaAddBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  mediaAddBtnText: {
    fontSize: typography.small,
    color: colors.textDark,
    fontWeight: '600',
  },
  mediaUploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary + '10',
  },
  mediaUploadBtnText: {
    fontSize: typography.small,
    color: colors.primary,
    fontWeight: '600',
  },

  pickerBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  pickerLabel: {
    fontSize: typography.small,
    color: colors.textGrey,
    fontWeight: '600',
  },
  pickerValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pickerValue: {
    fontSize: typography.small,
    color: colors.textDark,
    fontWeight: '700',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.xs,
  },
  pickerSheetTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: colors.textDark,
  },
  pickerSheet: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '50',
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary + '08',
  },
  pickerOptionText: {
    fontSize: typography.small,
    color: colors.textDark,
  },
  pickerOptionTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },

  triggerCard: {
    backgroundColor: colors.primary + '04',
    borderWidth: 1,
    borderColor: colors.primary + '20',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  triggerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + '15',
  },
  triggerTitle: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.primary,
  },
  addTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    marginTop: spacing.xs,
  },
  addTriggerText: {
    fontSize: typography.small,
    color: colors.primary,
    fontWeight: '700',
  },

  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '700',
  },
});