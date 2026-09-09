sed -i 's/export async function getNextUniqueTokenNumber(/export async function getNextUniqueTokenNumber(\n  projectId: string,\n  existingActiveProjects: UserActiveProject[] = [],\n  startDate?: string\n): Promise<{ tokenNumber: number; tokenDisplay: string }> {/g' src/lib/tokenService.ts

sed -i 's/  projectId: string,//2' src/lib/tokenService.ts
sed -i 's/  existingActiveProjects: UserActiveProject\[\] = \[\]//' src/lib/tokenService.ts
sed -i 's/): Promise<{ tokenNumber: number; tokenDisplay: string }> {//2' src/lib/tokenService.ts

sed -i 's/const prefix = getPlanTokenPrefix(projectId);/const prefix = getPlanTokenPrefix(projectId, startDate);/' src/lib/tokenService.ts

sed -i 's/const tokenResult = await getNextUniqueTokenNumber(project.id, existingActiveProjects);/const tokenResult = await getNextUniqueTokenNumber(project.id, existingActiveProjects, project.startDate);/' src/components/JoinProjectModal.tsx
