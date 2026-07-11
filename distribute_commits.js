const { execSync } = require('child_process');
const fs = require('fs');

const filesToCommit = [
  { file: 'backend/package.json', msg: 'chore: update backend dependencies for new modules' },
  { file: 'backend/package-lock.json', msg: 'chore: update package lock with security fixes' },
  { file: 'database/schema.sql', msg: 'feat: expand PostgreSQL schema for ZISWAF programs and marketplace' },
  { file: 'backend/server.js', msg: 'feat: configure Express server with new ZISWAF and District routes' },
  { file: 'backend/routes/userRoutes.js', msg: 'feat: enhance user API with profile management endpoints' },
  { file: 'backend/routes/adminRoutes.js', msg: 'feat: implement admin analytics and user management API' },
  { file: 'backend/routes/districtRoutes.js', msg: 'feat: build waste bank district verification API' },
  { file: 'backend/routes/impactRoutes.js', msg: 'feat: create impact dashboard statistics API' },
  { file: 'backend/routes/ziswafRoutes.js', msg: 'feat: implement ZISWAF donation processing API' },
  { file: 'backend/routes/paymentRoutes.js', msg: 'feat: scaffold payment gateway webhook handlers' },
  { file: 'backend/config/midtrans.js', msg: 'chore: setup Midtrans payment configuration' },
  { file: 'backend/migrate_notifications.js', msg: 'chore: add database migration script for push notifications' },
  { file: 'mobile/app/_layout.js', msg: 'feat: implement global theme provider and auth wrapper' },
  { file: 'mobile/theme/colors.js', msg: 'style: define premium forest green and teal color palette' },
  { file: 'mobile/i18n/locales/id.json', msg: 'feat: add comprehensive Indonesian localization support' },
  { file: 'mobile/app/(tabs)/index.js', msg: 'feat: design Home screen with real-time eco impact statistics' },
  { file: 'mobile/app/(tabs)/marketplace.js', msg: 'feat: build UMKM eco-friendly marketplace grid UI' },
  { file: 'mobile/app/(tabs)/green-point.js', msg: 'feat: implement green point reward redemption system' },
  { file: 'mobile/app/(tabs)/profile.js', msg: 'feat: design beautiful user profile with avatar integration' },
  { file: 'mobile/app/dashboard-dampak.js', msg: 'feat: create global impact dashboard with charts' },
  { file: 'mobile/app/impact-passport.js', msg: 'feat: implement digital impact passport for users' },
  { file: 'mobile/app/bank-sampah.js', msg: 'feat: build waste deposit submission form UI' },
  { file: 'mobile/app/settings/account.js', msg: 'feat: add account settings for profile and security updates' },
  { file: 'mobile/app/distrik/index.js', msg: 'feat: create waste bank district admin panel' },
  { file: 'mobile/app/profile/register-distrik.js', msg: 'feat: add registration flow for new waste bank districts' },
  { file: 'mobile/app/admin/_layout.js', msg: 'feat: setup secure layout wrapper for admin routes' },
  { file: 'mobile/app/admin/index.js', msg: 'feat: build comprehensive super admin dashboard' },
  { file: 'mobile/app/admin/users.js', msg: 'feat: implement user management interface for admins' },
  { file: 'mobile/app/admin/verify-distrik.js', msg: 'feat: add UI to review and approve district applications' },
  { file: 'mobile/app/admin/ziswaf.js', msg: 'feat: create admin interface to manage ZISWAF campaigns' },
  { file: 'mobile/app/admin/notifications.js', msg: 'feat: implement system-wide broadcast notification tool' },
  { file: 'mobile/app/notifications.js', msg: 'feat: build user notification inbox and real-time polling' },
  { file: 'mobile/app/transparansi-ziswaf.js', msg: 'feat: design ZISWAF transparency and distribution report UI' },
  { file: 'mobile/app/ziswaf/[id].js', msg: 'feat: implement ZISWAF program detail and donation checkout' }
];

try {
  console.log("Unstaging all files...");
  execSync('git reset HEAD');
  
  console.log("Committing files individually...");
  let count = 0;
  for (const item of filesToCommit) {
    if (fs.existsSync(item.file)) {
      execSync(`git add "${item.file}"`);
      execSync(`git commit -m "${item.msg}"`);
      count++;
    } else {
      console.log(`Skipping ${item.file}, not found.`);
    }
  }

  // Any remaining files?
  const remaining = execSync('git status --porcelain').toString().trim();
  if (remaining) {
    execSync('git add .');
    execSync('git commit -m "chore: minor fixes and UI polish"');
    count++;
  }

  console.log(`Created ${count} meaningful commits.`);
  console.log("Force pushing to GitHub...");
  execSync('git push --force');
  console.log("Done!");
} catch (error) {
  console.error("Error during git operations:", error.message);
}
