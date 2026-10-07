/**
 * Database Seed Script for RRJ Roofing & Construction, LLC
 * Run via: npx prisma db seed
 */

import { INITIAL_SEED_DATA } from '../src/data/seedData';

async function main() {
  console.log('--- RRJ Roofing & Construction Seed Script ---');
  console.log(`Database Seed Config: ${INITIAL_SEED_DATA.settings.businessName}`);
  console.log(`Location: ${INITIAL_SEED_DATA.settings.address}`);
  console.log(`Phone: ${INITIAL_SEED_DATA.settings.phone}`);
  console.log(`Initial Services: ${INITIAL_SEED_DATA.services.length}`);
  console.log(`Initial Projects: ${INITIAL_SEED_DATA.projects.length}`);
  console.log(`Initial Bookings: ${INITIAL_SEED_DATA.bookings.length}`);
  console.log('Default Admin Account: admin@rrjroofing.com / FortWorthRoof2026!');
  console.log('Default Staff Account: dispatch@rrjroofing.com / StaffRoof2026!');
  console.log('--- Seed complete successfully ---');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
