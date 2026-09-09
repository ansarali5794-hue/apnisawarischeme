import { saveAllTermsToFirestore, saveProjectToFirestore, saveBankAccountToFirestore } from './src/lib/firestoreService';
import { EXACT_TERMS_SECTIONS, VEHICLE_PROJECTS, DEFAULT_BANK_ACCOUNTS } from './src/data/mockData';

async function seed() {
  console.log("Seeding Terms...");
  await saveAllTermsToFirestore(EXACT_TERMS_SECTIONS);
  
  console.log("Seeding Projects...");
  for (const p of VEHICLE_PROJECTS) {
    await saveProjectToFirestore(p);
  }
  
  console.log("Seeding Bank Accounts...");
  for (const acc of DEFAULT_BANK_ACCOUNTS) {
    await saveBankAccountToFirestore(acc);
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
