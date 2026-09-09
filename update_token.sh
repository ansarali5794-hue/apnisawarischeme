sed -i 's/export function getPlanTokenPrefix(projectId: string): string {/export function getPlanTokenPrefix(projectId: string, startDate?: string): string {/' src/lib/tokenService.ts

sed -i 's/const year = new Date().getFullYear();/const year = startDate ? new Date(startDate).getFullYear() : new Date().getFullYear();/' src/lib/tokenService.ts

sed -i 's/export async function getNextUniqueTokenNumber(/export async function getNextUniqueTokenNumber(/' src/lib/tokenService.ts
