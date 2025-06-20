export function getListSettingRobot(robots: any[]): { _id: string, name: string, rackSettings: any, barrelSettings:any }[] {
    return robots.map(robot => ({
      _id: robot._id,
      name: robot.name,
      rackSettings: robot.rackSettings ?? {},
      barrelSettings: robot.barrelSettings ?? {},
    }));
  }
  