export class EventMetricsResponse {
  memory: {
    total: number;
    free: number;
    used: number;
    usedPercent: number;
  };
  storage: {
    filesystem: string;
    size: string;
    used: string;
    avail: string;
    usedPercent: string;
    mount: string;
  }[];
  cpu: {
    cores: number;
    loadAvg: number[];
    usagePerCore: number[];
  };
  topProcesses: {
    pid: number;
    memPercent: number;
    command: string;
  }[];
  network: {
    iface: string;
    rxBytes: number;
    txBytes: number;
  }[];
  uptime: number;
}
