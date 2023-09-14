export const formatPid = (pid: string) => {
  return pid.slice(0, 3) + '-' + pid.slice(3, 6) + '-' + pid.slice(6);
};
