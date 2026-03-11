import {
  ActivityDefinition,
  ActivityType,
  LearningArea,
  SkillArea
} from "@/types/activity";

const learningAreaMap: Partial<Record<LearningArea, SkillArea>> = {
  "pattern-recognition": "pattern-recognition",
  "logic-reasoning": "logic-reasoning",
  "spatial-thinking": "spatial-reasoning",
  memory: "memory",
  "problem-solving": "problem-solving",
  sequencing: "sequencing",
  classification: "sorting-classification"
};

const activityTypeSkillMap: Record<ActivityType, SkillArea[]> = {
  "shape-match": ["shape-recognition", "pattern-recognition", "spatial-reasoning"],
  "count-objects": ["pattern-recognition", "problem-solving", "memory"],
  "pattern-complete": ["pattern-recognition", "sequencing", "problem-solving"],
  "sort-game": ["sorting-classification", "logic-reasoning"],
  "odd-one-out": ["sorting-classification", "logic-reasoning", "problem-solving"],
  "sequence-order": ["sequencing", "logic-reasoning", "problem-solving"],
  "memory-cards": ["memory", "pattern-recognition"],
  "logic-game": ["logic-reasoning", "problem-solving"],
  "maze-path": ["spatial-reasoning", "problem-solving", "sequencing"],
  "connect-logic": ["logic-reasoning", "sorting-classification", "memory"],
  "code-blocks": ["early-coding-logic", "sequencing", "problem-solving"],
  "word-builder": ["memory", "logic-reasoning", "problem-solving"]
};

const primarySkillByType: Record<ActivityType, SkillArea> = {
  "shape-match": "shape-recognition",
  "count-objects": "pattern-recognition",
  "pattern-complete": "pattern-recognition",
  "sort-game": "sorting-classification",
  "odd-one-out": "logic-reasoning",
  "sequence-order": "sequencing",
  "memory-cards": "memory",
  "logic-game": "logic-reasoning",
  "maze-path": "spatial-reasoning",
  "connect-logic": "logic-reasoning",
  "code-blocks": "early-coding-logic",
  "word-builder": "memory"
};

const skillLabels: Record<SkillArea, string> = {
  "shape-recognition": "Shape recognition",
  "pattern-recognition": "Pattern recognition",
  sequencing: "Sequencing",
  "sorting-classification": "Sorting and classification",
  "spatial-reasoning": "Spatial reasoning",
  "logic-reasoning": "Logic reasoning",
  memory: "Memory",
  "early-coding-logic": "Early coding logic",
  "problem-solving": "Problem solving"
};

const levelRoleTitles: Record<SkillArea, string> = {
  "shape-recognition": "Shape Explorer",
  "pattern-recognition": "Pattern Builder",
  sequencing: "Sequence Scout",
  "sorting-classification": "Sorting Star",
  "spatial-reasoning": "Path Finder",
  "logic-reasoning": "Logic Learner",
  memory: "Memory Spark",
  "early-coding-logic": "Junior Coder",
  "problem-solving": "Puzzle Solver"
};

export function getSkillAreaLabel(skillArea: SkillArea) {
  return skillLabels[skillArea];
}

export function getSkillLevelLabel(skillArea: SkillArea, level: number) {
  return `Level ${level} ${levelRoleTitles[skillArea]}`;
}

export function mapLearningAreasToSkillAreas(learningAreas: LearningArea[] = []) {
  return learningAreas.reduce<SkillArea[]>((result, area) => {
    const mapped = learningAreaMap[area];
    if (!mapped || result.includes(mapped)) return result;
    return [...result, mapped];
  }, []);
}

export function deriveSkillAreasForActivity(activity: ActivityDefinition) {
  if (activity.skillAreas?.length) {
    return activity.skillAreas;
  }

  const fromLearningAreas = mapLearningAreasToSkillAreas(activity.learningAreas);
  const byType = activityTypeSkillMap[activity.type] ?? [];

  return Array.from(new Set([...fromLearningAreas, ...byType]));
}

export function getPrimarySkillArea(activity: ActivityDefinition) {
  return (
    activity.primarySkillArea ??
    deriveSkillAreasForActivity(activity)[0] ??
    primarySkillByType[activity.type]
  );
}

export function getPositiveSkillSummary(skillArea: SkillArea, level: number) {
  return `${getSkillLevelLabel(skillArea, level)} is growing with every fresh challenge.`;
}

export function buildNextGoal(skillArea: SkillArea, level: number) {
  return `Keep practicing ${getSkillAreaLabel(skillArea).toLowerCase()} at Level ${level} to unlock the next challenge.`;
}

export const allSkillAreas = Object.keys(skillLabels) as SkillArea[];
