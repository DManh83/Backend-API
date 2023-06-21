export type CronJob = {
  name: string;
  schedule: string;
  handler: () => Promise<void>;
  preventDuplicates?: boolean;
};
