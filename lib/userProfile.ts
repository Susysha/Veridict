const KEY = "veridict_profile";

export interface UserProfile {
    name: string;
    targetRole: string;
    experienceLevel: string;
    onboardingDone: boolean;
    streakDates: string[]; // ISO date strings "YYYY-MM-DD"
}

const defaults: UserProfile = {
    name: "",
    targetRole: "",
    experienceLevel: "Mid-Level",
    onboardingDone: false,
    streakDates: [],
};

export function getProfile(): UserProfile {
    if (typeof window === "undefined") return { ...defaults };
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return { ...defaults };
        return { ...defaults, ...JSON.parse(raw) };
    } catch {
        return { ...defaults };
    }
}

export function saveProfile(partial: Partial<UserProfile>): UserProfile {
    const current = getProfile();
    const next = { ...current, ...partial };
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
}

function toDateStr(d: Date): string {
    return d.toISOString().split("T")[0];
}

/** Call once per dashboard mount — only records once per calendar day. */
export function recordTodayVisit(): void {
    if (typeof window === "undefined") return;
    const today = toDateStr(new Date());
    const profile = getProfile();
    if (!profile.streakDates.includes(today)) {
        saveProfile({ streakDates: [...profile.streakDates, today] });
    }
}

/** Returns the current consecutive-day streak (counting back from today). */
export function getStreak(): number {
    const { streakDates } = getProfile();
    if (!streakDates.length) return 0;

    const sorted = [...new Set(streakDates)].sort().reverse();
    const today = toDateStr(new Date());

    // Streak must include today or yesterday (if not opened today yet)
    if (sorted[0] !== today) {
        const yesterday = toDateStr(new Date(Date.now() - 86400000));
        if (sorted[0] !== yesterday) return 0;
    }

    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1]);
        const curr = new Date(sorted[i]);
        const diff = (prev.getTime() - curr.getTime()) / 86400000;
        if (Math.round(diff) === 1) streak++;
        else break;
    }
    return streak;
}

/** Returns an array of 7 booleans for Mon–Sun of the current week. */
export function getWeekDots(): boolean[] {
    const { streakDates } = getProfile();
    const dateSet = new Set(streakDates);
    const today = new Date();
    // Day of week: 0=Sun, need Mon-based
    const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0 … Sun=6
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - dayOfWeek + i);
        return dateSet.has(toDateStr(d));
    });
}
