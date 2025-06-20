export function getListSettingTimer(tankGroups: any[]): { _id: string, name: string, timer: number | null }[] {
  return tankGroups.map(group => ({
    _id: group._id,
    name: group.name,
    timer: group.settings?.timer ?? null
  }));
}
