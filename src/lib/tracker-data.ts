// All static data for the 90-Day Transformation Tracker

export interface TimetableItem {
  id: string;
  time: string;
  activity: string;
  details: string;
  linked?: string;
  icon: string;
}

export interface NutritionItem {
  id: string;
  name: string;
  qty: string;
  pro: number;
  cal: number;
  water: number;
}

export interface NutritionGroup {
  id: string;
  title: string;
  time: string;
  target?: string;
  icon: string;
  items: NutritionItem[];
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number | string;
  reps: string;
  tips?: string;
}

export interface WorkoutDay {
  focus: string;
  duration: string;
  note: string;
  restTimer: number;
  routine: WorkoutExercise[];
}

export interface GroceryCategory {
  category: string;
  items: string[];
}

export const TIMETABLE: TimetableItem[] = [
  { id: 't1', time: '6:30 AM', activity: 'Wake Up', details: 'Drink 500 ml water', linked: 'n1', icon: 'sun' },
  { id: 't2', time: '6:40 AM', activity: 'Sunlight', details: '10 minutes outdoor sunlight', icon: 'sun' },
  { id: 't3', time: '7:00 AM', activity: 'Pre-Breakfast', details: '1 banana + 5 almonds + 300 ml water', linked: 'n2', icon: 'apple' },
  { id: 't4', time: '8:00 AM', activity: 'Breakfast', details: '80g oats + 300ml milk + 15g peanuts + 3 whole eggs + 2 egg whites', linked: 'n3', icon: 'utensils' },
  { id: 't5', time: '11:00 AM', activity: 'Snack & Hydrate', details: '1 banana or 1 apple + 700 ml water', linked: 'n4', icon: 'apple' },
  { id: 't6', time: '1:30 PM', activity: 'Lunch', details: '250g cooked rice + 150g dal + veg + 60g raw soya chunks + 100g curd + 300ml water', linked: 'n5', icon: 'utensils' },
  { id: 't7', time: '2:00 PM', activity: 'Walk', details: '10-minute slow walk', icon: 'footprints' },
  { id: 't_w', time: '3:00 PM', activity: 'Afternoon Hydration', details: 'Drink 500 ml water', linked: 'n6', icon: 'droplet' },
  { id: 't8', time: '4:30 PM', activity: 'Pre-Workout', details: '1 banana + 1 cup black coffee', linked: 'n7', icon: 'flame' },
  { id: 't9', time: '5:00 PM', activity: 'Workout', details: 'Follow workout schedule + 500ml water', linked: 'workout', icon: 'dumbbell' },
  { id: 't10', time: '6:00 PM', activity: 'Post-Workout', details: '3 boiled eggs', linked: 'n8', icon: 'utensils' },
  { id: 't11', time: '7:00 PM', activity: 'Walk', details: '15–20 minutes', icon: 'footprints' },
  { id: 't12', time: '8:30 PM', activity: 'Dinner', details: '200g cooked rice + 150g dal + veg + 3 eggs + 200ml water', linked: 'n9', icon: 'utensils' },
  { id: 't13', time: '10:00 PM', activity: 'Before Bed', details: '100g curd + 300 ml water', linked: 'n10', icon: 'moon' },
  { id: 't14', time: '10:30 PM', activity: 'Sleep', details: 'Minimum 7–8 hours', icon: 'bed' },
];

export const NUTRITION_PLAN: NutritionGroup[] = [
  {
    id: 'n1', title: 'Wake Up', time: '6:30 AM', icon: 'droplet',
    items: [{ id: 'i1', name: 'Water (Wake Up)', qty: '500 ml', pro: 0, cal: 0, water: 500 }]
  },
  {
    id: 'n2', title: 'Pre-Breakfast', time: '7:00 AM', icon: 'apple',
    items: [
      { id: 'i2', name: 'Banana', qty: '1', pro: 1, cal: 105, water: 0 },
      { id: 'i3', name: 'Almonds', qty: '5', pro: 1, cal: 35, water: 0 },
      { id: 'i4', name: 'Water (Breakfast)', qty: '300 ml', pro: 0, cal: 0, water: 300 },
    ]
  },
  {
    id: 'n3', title: 'Breakfast', time: '8:00 AM', target: '~50g Protein', icon: 'utensils',
    items: [
      { id: 'i5', name: 'Oats', qty: '80 g', pro: 10, cal: 310, water: 0 },
      { id: 'i6', name: 'Milk', qty: '300 ml', pro: 10, cal: 180, water: 0 },
      { id: 'i7', name: 'Peanuts', qty: '15 g', pro: 4, cal: 85, water: 0 },
      { id: 'i8', name: 'Whole Eggs', qty: '3', pro: 18, cal: 210, water: 0 },
      { id: 'i9', name: 'Egg Whites', qty: '2', pro: 8, cal: 35, water: 0 },
    ]
  },
  {
    id: 'n4', title: 'Morning Snack', time: '11:00 AM', icon: 'apple',
    items: [
      { id: 'i10', name: 'Banana OR Apple', qty: '1', pro: 1, cal: 95, water: 0 },
      { id: 'i11', name: 'Water (Morning)', qty: '700 ml', pro: 0, cal: 0, water: 700 },
    ]
  },
  {
    id: 'n5', title: 'Lunch', time: '1:30 PM', target: '~35g Protein', icon: 'utensils',
    items: [
      { id: 'i12', name: 'Cooked Rice', qty: '250 g', pro: 0, cal: 325, water: 0 },
      { id: 'i13', name: 'Dal', qty: '150 g', pro: 5, cal: 150, water: 0 },
      { id: 'i14', name: 'Vegetables', qty: '1 Bowl', pro: 0, cal: 50, water: 0 },
      { id: 'i15', name: 'Soya Chunks (raw)', qty: '60 g', pro: 30, cal: 200, water: 0 },
      { id: 'i16', name: 'Curd', qty: '100 g', pro: 0, cal: 60, water: 0 },
      { id: 'i17', name: 'Water (Lunch)', qty: '300 ml', pro: 0, cal: 0, water: 300 },
    ]
  },
  {
    id: 'n6', title: 'Afternoon Hydration', time: '3:00 PM', icon: 'droplet',
    items: [{ id: 'i18', name: 'Water (Afternoon)', qty: '500 ml', pro: 0, cal: 0, water: 500 }]
  },
  {
    id: 'n7', title: 'Pre-Workout', time: '4:30 PM', icon: 'flame',
    items: [
      { id: 'i19', name: 'Banana', qty: '1', pro: 1, cal: 105, water: 0 },
      { id: 'i20', name: 'Black Coffee', qty: '1 cup', pro: 0, cal: 5, water: 0 },
    ]
  },
  {
    id: 'n8', title: 'Post-Workout', time: '6:00 PM', target: '18g Protein', icon: 'dumbbell',
    items: [
      { id: 'i21', name: 'Boiled Eggs', qty: '3', pro: 18, cal: 210, water: 0 },
      { id: 'i_w_w', name: 'Water (Workout)', qty: '500 ml', pro: 0, cal: 0, water: 500 },
    ]
  },
  {
    id: 'n9', title: 'Dinner', time: '8:30 PM', target: '~25g Protein', icon: 'utensils',
    items: [
      { id: 'i23', name: 'Cooked Rice', qty: '200 g', pro: 0, cal: 260, water: 0 },
      { id: 'i24', name: 'Dal', qty: '150 g', pro: 7, cal: 150, water: 0 },
      { id: 'i25', name: 'Vegetables', qty: '1 Bowl', pro: 0, cal: 50, water: 0 },
      { id: 'i26', name: 'Eggs', qty: '3', pro: 18, cal: 210, water: 0 },
      { id: 'i27', name: 'Water (Dinner)', qty: '200 ml', pro: 0, cal: 0, water: 200 },
    ]
  },
  {
    id: 'n10', title: 'Before Bed', time: '10:00 PM', icon: 'moon',
    items: [
      { id: 'i28', name: 'Curd', qty: '100 g', pro: 0, cal: 60, water: 0 },
      { id: 'i29', name: 'Water (Before Bed)', qty: '300 ml', pro: 0, cal: 0, water: 300 },
    ]
  },
];

export const GROCERY_LIST: GroceryCategory[] = [
  { category: 'Proteins', items: ['Eggs (Tray of 30+)', 'Soya Chunks (500g)', 'Milk (3-4 Liters/week)', 'Curd (1.5kg/week)'] },
  { category: 'Carbs & Fats', items: ['Oats (1kg)', 'White/Brown Rice', 'Dal / Lentils (1kg)', 'Peanuts (250g)', 'Almonds (100g)'] },
  { category: 'Produce', items: ['Bananas (Dozen)', 'Apples', 'Mixed Vegetables'] },
  { category: 'Extras', items: ['Black Coffee Powder'] },
];

export const BASE_WORKOUTS: Record<string, Omit<WorkoutDay, 'restTimer'>> = {
  Monday: {
    focus: 'Chest + Shoulders + Triceps', duration: '60 min', note: 'Rest 60–90 sec between sets.',
    routine: [
      { id: 'w_m1', name: 'Push-ups', sets: 4, reps: '10' },
      { id: 'w_m2', name: 'Incline Push-ups', sets: 3, reps: '12' },
      { id: 'w_m3', name: 'Pike Push-ups', sets: 3, reps: '8' },
      { id: 'w_m4', name: 'Chair Dips', sets: 3, reps: '10' },
      { id: 'w_m5', name: 'Water Bottle Lateral Raises', sets: 3, reps: '15' },
      { id: 'w_m6', name: 'Plank', sets: 3, reps: '45 sec' },
    ]
  },
  Tuesday: {
    focus: 'Back + Biceps', duration: '60 min', note: 'Use a backpack filled with books.',
    routine: [
      { id: 'w_t1', name: 'Backpack Rows', sets: 4, reps: '12' },
      { id: 'w_t2', name: 'Towel Rows', sets: 3, reps: '12' },
      { id: 'w_t3', name: 'Backpack Curls', sets: 3, reps: '15' },
      { id: 'w_t4', name: 'Superman Hold', sets: 3, reps: '30 sec' },
      { id: 'w_t5', name: 'Dead Hangs', sets: 3, reps: 'Max Time' },
    ]
  },
  Wednesday: {
    focus: 'Legs + Abs', duration: '60 min', note: 'Rest 60–90 sec between sets.',
    routine: [
      { id: 'w_w1', name: 'Squats', sets: 4, reps: '20' },
      { id: 'w_w2', name: 'Lunges', sets: 3, reps: '12/leg' },
      { id: 'w_w3', name: 'Glute Bridges', sets: 3, reps: '15' },
      { id: 'w_w4', name: 'Calf Raises', sets: 4, reps: '25' },
      { id: 'w_w5', name: 'Leg Raises', sets: 3, reps: '15' },
      { id: 'w_w6', name: 'Bicycle Crunches', sets: 3, reps: '20' },
    ]
  },
  Thursday: {
    focus: 'Walking/Cardio', duration: '45 min', note: 'Cardio Focus.',
    routine: [
      { id: 'w_th1', name: 'Brisk Walk', sets: 1, reps: '45 min' },
      { id: 'w_th2', name: 'OR Light Jog', sets: 1, reps: '20 min' },
    ]
  },
  Friday: {
    focus: 'Upper Body', duration: '60 min', note: 'Rest 60–90 sec between sets.',
    routine: [
      { id: 'w_f1', name: 'Push-ups', sets: 5, reps: '12' },
      { id: 'w_f2', name: 'Pike Push-ups', sets: 4, reps: '10' },
      { id: 'w_f3', name: 'Backpack Rows', sets: 4, reps: '15' },
      { id: 'w_f4', name: 'Chair Dips', sets: 4, reps: '12' },
      { id: 'w_f5', name: 'Lateral Raises', sets: 4, reps: '15' },
      { id: 'w_f6', name: 'Plank', sets: 3, reps: '60 sec' },
    ]
  },
  Saturday: {
    focus: 'Cardio + Abs', duration: '45 min', note: 'Cardio first, then Abs.',
    routine: [
      { id: 'w_s1', name: 'Brisk Walking/Jogging', sets: 1, reps: '40 min' },
      { id: 'w_s2', name: 'Leg Raises', sets: 3, reps: '15' },
      { id: 'w_s3', name: 'Russian Twists', sets: 3, reps: '20' },
      { id: 'w_s4', name: 'Plank', sets: 3, reps: '60 sec' },
    ]
  },
  Sunday: {
    focus: 'Rest', duration: 'Recovery', note: 'Recover and prepare for next week.',
    routine: [{ id: 'w_su1', name: 'Rest & Recovery', sets: '-', reps: '-' }],
  },
};

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export function getDynamicWorkouts(week: number): Record<string, WorkoutDay> {
  const dynamic: Record<string, WorkoutDay> = {};
  
  for (const [day, workout] of Object.entries(BASE_WORKOUTS)) {
    const cloned = JSON.parse(JSON.stringify(workout)) as WorkoutDay;
    
    if (cloned.focus !== 'Rest' && cloned.focus !== 'Cardio' && cloned.focus !== 'Walking/Cardio') {
      for (const ex of cloned.routine) {
        if (week >= 3) {
          if (typeof ex.reps === 'string' && ex.reps.includes('/leg')) {
            const num = parseInt(ex.reps);
            ex.reps = `${num + 2}/leg`;
          } else if (typeof ex.reps === 'string' && !ex.reps.includes('sec') && !ex.reps.includes('Max') && !ex.reps.includes('min')) {
            const num = parseInt(ex.reps);
            if (!isNaN(num)) ex.reps = `${num + 2}`;
          }
        }
        if (week >= 5) {
          if (['Squats', 'Lunges', 'Glute Bridges', 'Calf Raises', 'Towel Rows'].includes(ex.name)) {
            ex.name += ' 🎒 (+Wt)';
          }
        }
        if (week >= 7 && typeof ex.sets === 'number') {
          ex.sets = ex.sets + 1;
        }
      }
      cloned.restTimer = week >= 9 ? 45 : 60;
      if (week >= 9) cloned.note = 'Reduce rest times to 45s.';
      if (week >= 11) cloned.note = 'MAXIMUM EFFORT. Empty the tank.';
    } else {
      cloned.restTimer = 60;
    }
    
    dynamic[day] = cloned;
  }
  
  return dynamic;
}

export function hasTimePassed(timeString: string): boolean {
  if (!timeString || !timeString.includes(':')) return true;
  const now = new Date();
  const parts = timeString.split(' ');
  if (parts.length < 2) return true;
  
  let [hours, minutes] = parts[0].split(':');
  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  if (isNaN(h) || isNaN(m)) return true;
  
  let hrs = h;
  if (hrs === 12 && parts[1] === 'AM') hrs = 0;
  if (hrs !== 12 && parts[1] === 'PM') hrs += 12;
  
  const taskTime = new Date();
  taskTime.setHours(hrs, m, 0, 0);
  return now >= taskTime;
}

export interface HistoryEntry {
  score: number;
  weight: number;
  energyLevel: number;
  steps: number;
}

export type HistoryMap = Record<string, HistoryEntry>;

export interface PhotoCheckin {
  date: string;
  timestamp: number;
  front: string | null;
  side: string | null;
  waist: number | null;
}
