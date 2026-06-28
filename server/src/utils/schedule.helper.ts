import cron from 'node-cron';

// Placeholder for scheduled tasks:
// - Daily interest calculation on savings
// - Installment due date reminders
// - Late fee assessment
// - Monthly report generation

export function scheduleJobs(): void {
  // Daily at midnight: calculate savings interest
  cron.schedule('0 0 * * *', () => {
    console.log('[Scheduler] Running daily savings interest calculation...');
    // TODO: implement
  });

  // Daily at 8 AM: check installment dues
  cron.schedule('0 8 * * *', () => {
    console.log('[Scheduler] Checking installment dues...');
    // TODO: implement
  });

  console.log('[Scheduler] Cron jobs registered.');
}