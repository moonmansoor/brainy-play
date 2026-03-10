export type UserRole = "child" | "parent" | "admin";

export type ActivityType =
  | "shape-match"
  | "count-objects"
  | "pattern-complete"
  | "sort-game"
  | "odd-one-out"
  | "sequence-order"
  | "memory-cards"
  | "logic-game"
  | "maze-path";

export type Difficulty = 1 | 2 | 3;

export type ShapeKind = "circle" | "square" | "triangle" | "star";

export type ActivityAssetType = "image" | "audio";

export type ThemeId =
  | "animals"
  | "space"
  | "dinosaurs"
  | "ocean"
  | "robots"
  | "nature";

export type RewardStyle = "sparkles" | "badges" | "stickers";

export type AvatarStyle = "adventurer" | "dreamer" | "explorer";

export type ChildThemePreferences = {
  favoriteThemes: ThemeId[];
  favoriteColor?: string;
  preferredRewardStyle?: RewardStyle;
  preferredAvatarStyle?: AvatarStyle;
};

export type ChildProfile = {
  id: string;
  parentId: string;
  displayName: string;
  birthDate: string;
  schoolName?: string;
  schoolStandard?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  progressSummary?: string;
  themePreferences?: ChildThemePreferences;
};

export type ParentProfile = {
  id: string;
  role: Extract<UserRole, "parent" | "admin">;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ActivityAsset = {
  id: string;
  activityId: string;
  assetType: ActivityAssetType;
  fileUrl: string;
  metadata: Record<string, string | number | boolean>;
};

export type ShapeOption = {
  id: string;
  shape: ShapeKind;
  color: string;
};

export type ShapeMatchConfig = {
  promptShape: ShapeKind;
  promptColor: string;
  options: ShapeOption[];
};

export type CountObjectsConfig = {
  count: number;
  options: number[];
};

export type PatternStep = {
  id: string;
  shape: ShapeKind;
  color: string;
};

export type PatternCompleteConfig = {
  sequence: PatternStep[];
  options: PatternStep[];
};

export type OddOneOutOption = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  shape?: ShapeKind;
};

export type OddOneOutConfig = {
  options: OddOneOutOption[];
};

export type SequenceOrderStep = {
  id: string;
  label: string;
  emoji: string;
  description?: string;
};

export type SequenceOrderConfig = {
  steps: SequenceOrderStep[];
};

export type SortGroup = {
  id: string;
  label: string;
  emoji: string;
  color: string;
};

export type SortOption = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  shape?: ShapeKind;
};

export type SortGameConfig = {
  groups: SortGroup[];
  options: SortOption[];
};

export type MemoryCardConfig = {
  cards: Array<{
    id: string;
    emoji: string;
    pairId: string;
  }>;
};

export type LogicGameConfig = {
  prompt: string;
  choices: Array<{
    id: string;
    label: string;
    emoji?: string;
  }>;
};

export type MazePathConfig = {
  prompt: string;
  options: Array<{
    id: string;
    label: string;
    directions: string[];
  }>;
};

export type ActivityItemConfig =
  | ShapeMatchConfig
  | CountObjectsConfig
  | PatternCompleteConfig
  | OddOneOutConfig
  | SequenceOrderConfig
  | SortGameConfig
  | MemoryCardConfig
  | LogicGameConfig
  | MazePathConfig;

export type ShapeMatchAnswer = {
  correctOptionId: string;
};

export type CountObjectsAnswer = {
  correctCount: number;
};

export type PatternCompleteAnswer = {
  correctOptionId: string;
};

export type OddOneOutAnswer = {
  correctOptionId: string;
};

export type SequenceOrderAnswer = {
  correctOrderIds: string[];
};

export type SortGameAnswer = {
  correctGroups: Record<string, string>;
};

export type MemoryCardAnswer = {
  pairIds: string[];
};

export type LogicGameAnswer = {
  correctChoiceId: string;
};

export type MazePathAnswer = {
  correctOptionId: string;
};

export type ActivityItemAnswer =
  | ShapeMatchAnswer
  | CountObjectsAnswer
  | PatternCompleteAnswer
  | OddOneOutAnswer
  | SequenceOrderAnswer
  | SortGameAnswer
  | MemoryCardAnswer
  | LogicGameAnswer
  | MazePathAnswer;

export type ActivityItemAssetReference = {
  id: string;
  assetType: ActivityAssetType;
  label?: string;
  fileUrl?: string;
};

export type ActivityItem = {
  id: string;
  activityId: string;
  orderIndex: number;
  promptText?: string;
  config: ActivityItemConfig;
  answer: ActivityItemAnswer;
  assetRefs?: ActivityItemAssetReference[];
  difficultyOverride?: Difficulty;
  createdAt: string;
  updatedAt: string;
};

export type ThemePack = {
  id: ThemeId;
  name: string;
  description: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  textOnAccent: string;
  gradient: string;
  surfaceGradient: string;
  imageUrl: string;
  sticker: string;
  mascotName: string;
};

export type ActivityVisualTheme = {
  themeId: ThemeId;
  cardTitle: string;
  cardBlurb: string;
  heroTitle: string;
  heroHint: string;
  imageUrl: string;
  mascotMood: string;
  objectEmoji?: string;
  objectLabel?: string;
  shapeLabels?: Partial<Record<ShapeKind, string>>;
  shapeIcons?: Partial<Record<ShapeKind, string>>;
};

export type ActivityDefinition = {
  id: string;
  title: string;
  slug: string;
  type: ActivityType;
  ageMin: number;
  ageMax: number;
  difficulty: Difficulty;
  instructionsText: string;
  instructionsAudioUrl?: string;
  thumbnailUrl?: string;
  settingsConfig?: Record<string, unknown>;
  defaultThemeId: ThemeId;
  supportedThemeIds: ThemeId[];
  visualThemes: ActivityVisualTheme[];
  items: ActivityItem[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ActivityAttempt = {
  id: string;
  childId: string;
  activityId: string;
  score: number;
  starsEarned: number;
  completed: boolean;
  hintsUsed: number;
  mistakesCount: number;
  durationSeconds: number;
  startedAt: string;
  finishedAt: string;
};

export type Badge = {
  id: string;
  code: string;
  title: string;
  description: string;
  imageUrl?: string;
};

export type ChildBadge = {
  id: string;
  childId: string;
  badgeId: string;
  awardedAt: string;
};

export type ActivityCompletionPayload = {
  childId: string;
  activityId: string;
  score: number;
  starsEarned: number;
  completed: boolean;
  hintsUsed: number;
  mistakesCount: number;
  durationSeconds: number;
  startedAt: string;
  finishedAt: string;
};

export type ActivityOutcome = {
  isCorrect: boolean;
  score: number;
  starsEarned: number;
  mistakesCount: number;
  completed: boolean;
  durationSeconds: number;
};
