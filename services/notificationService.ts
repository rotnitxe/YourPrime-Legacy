
import { Program, WorkoutLog, Settings, Session } from '../types';
import { Capacitor } from '@capacitor/core';

// Helper to find the next occurrence of a given day of the week
const getNextDateForDay = (dayOfWeek: number, time: string, startWeekOn: number | 'lunes' | 'domingo'): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const resultDate = new Date();
    resultDate.setHours(hours, minutes, 0, 0);

    let currentDay = now.getDay(); // 0 = Sunday
    
    let startDayNum = 1; // Default Monday
    if (typeof startWeekOn === 'number') startDayNum = startWeekOn;
    else if (startWeekOn === 'domingo') startDayNum = 0;
    
    // Adjust currentDay based on start of week to calculate relative day
    // This part is tricky because JS getDay() is always 0-6 (Sun-Sat).
    // The logic below simplifies by just using standard JS days (0=Sun...6=Sat)
    // and calculating the diff directly.

    let daysUntilTarget = dayOfWeek - currentDay;

    // If the day is today but the time has passed, or if the day is in the past this week
    if (daysUntilTarget < 0 || (daysUntilTarget === 0 && now.getTime() > resultDate.getTime())) {
        daysUntilTarget += 7; // Schedule for next week
    }

    resultDate.setDate(now.getDate() + daysUntilTarget);
    return resultDate;
};


// Request permissions to send notifications
export const requestPermissions = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return false;
    try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
    } catch (e) {
        console.error('Error requesting notification permissions', e);
        return false;
    }
};

// Cancel any pending notifications
export const cancelPendingNotifications = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
            await LocalNotifications.cancel(pending);
             console.log('Cancelled pending notifications.');
        }
    } catch (e) {
        console.error('Error canceling notifications', e);
    }
};


// Schedule reminders for the week
export const scheduleWorkoutReminders = async (programs: Program[], settings: Settings) => {
    if (!settings.remindersEnabled || !settings.reminderTime || !Capacitor.isNativePlatform()) {
        return;
    }

    // First, clear any old reminders
    await cancelPendingNotifications();
    
    // Dynamically import LocalNotifications
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    
    // Check if permissions are granted
    const permissions = await LocalNotifications.checkPermissions();
    if (permissions.display !== 'granted') {
        console.log("Notification permissions not granted. Skipping scheduling.");
        return;
    }

    const sessionsToSchedule: { session: Session; program: Program }[] = [];
    
    // Gather all sessions that have a specific day of the week assigned
    programs.forEach(program => {
        (program.macrocycles || []).forEach(macro => {
            (macro.mesocycles || []).forEach(meso => {
                (meso.weeks || []).forEach(week => {
                    (week.sessions || []).forEach(session => {
                        if (session.dayOfWeek !== undefined && session.dayOfWeek >= 0 && session.dayOfWeek <= 6) {
                            sessionsToSchedule.push({ session, program });
                        }
                    });
                });
            });
        });
    });

    if (sessionsToSchedule.length === 0) {
        console.log("No sessions with assigned days to schedule reminders for.");
        return;
    }

    const notifications = sessionsToSchedule.map(({ session, program }, index) => {
        const scheduleDate = getNextDateForDay(session.dayOfWeek!, settings.reminderTime!, settings.startWeekOn);
        return {
            id: 100 + index, // Unique ID for each notification
            title: '🔥 ¡Hora de entrenar!',
            body: `Tu sesión de "${session.name}" del programa "${program.name}" te espera.`,
            schedule: { at: scheduleDate, repeats: true, every: 'week' as const },
            sound: undefined,
            attachments: undefined,
            actionTypeId: '',
            extra: null,
        };
    });
    
    try {
        await LocalNotifications.schedule({ notifications });
        console.log(`Scheduled ${notifications.length} weekly workout reminders.`);
    } catch (e) {
        console.error('Error scheduling notifications', e);
    }
};