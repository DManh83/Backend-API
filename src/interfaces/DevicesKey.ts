export interface DeviceAttributes {
  id: string;
  userId: string;
  token: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DeviceCreation = Omit<DeviceAttributes, 'id'>;

export interface AddDevicesTokenParams {
  token: string;
}
