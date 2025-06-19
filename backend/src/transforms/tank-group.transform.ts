export function getListSettingTimer(tankGroups: any[]): { tankGroupId: string, name: string, timer: number | null }[] {
  return tankGroups.map(group => ({
    tankGroupId: group._id,
    name: group.name,
    timer: group.settings?.timer ?? null
  }));
}
