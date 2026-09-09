sed -i 's/import { AdminTermsSection } from '"'"'..\/components\/AdminTermsSection'"'"';/import { AdminTermsSection } from '"'"'..\/components\/AdminTermsSection'"'"';\nimport { AdminTokenLedgerSection } from '"'"'..\/components\/AdminTokenLedgerSection'"'"';/' src/views/AdminView.tsx

sed -i 's/{ id: '"'"'approvals'"'"'/{ id: '"'"'ledger'"'"', label: currentLang === '"'"'sd'"'"' ? '"'"'ٽوڪن ليجر'"'"' : currentLang === '"'"'ur'"'"' ? '"'"'ٹوکن لیجر'"'"' : '"'"'Token Ledger'"'"', icon: FileSpreadsheet },\n          { id: '"'"'approvals'"'"'/' src/views/AdminView.tsx

sed -i 's/export const AdminView: React.FC<AdminViewProps> = ({/export const AdminView: React.FC<AdminViewProps> = ({/' src/views/AdminView.tsx
