export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
};

export const testAddresses = {
  primary: {
    name: 'Головна квартира',
    street: 'вул. Хрещатик, 1',
    city: 'Київ',
    region: 'Київська область',
    addressType: 'apartment',
  },
  secondary: {
    name: 'Дача',
    street: 'вул. Лісова, 15',
    city: 'Бровари',
    region: 'Київська область',
    addressType: 'house',
  },
};

export const testMeters = {
  electricity: {
    serialNumber: 'EL-001-2024',
    type: 'electricity',
    tariff: 'single',
  },
  gas: {
    serialNumber: 'GS-001-2024',
    type: 'gas',
    unit: 'm3',
  },
  coldWater: {
    serialNumber: 'CW-001-2024',
    type: 'water',
    subType: 'cold',
  },
  hotWater: {
    serialNumber: 'HW-001-2024',
    type: 'water',
    subType: 'hot',
  },
};

export const testReadings = {
  electricity: {
    previous: '12500',
    current: '12750',
    expectedConsumption: '250',
  },
  gas: {
    previous: '1500',
    current: '1520',
    expectedConsumption: '20',
  },
  water: {
    previous: '350',
    current: '365',
    expectedConsumption: '15',
  },
};
