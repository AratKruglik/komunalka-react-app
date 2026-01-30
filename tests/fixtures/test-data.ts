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
    id: 1,
    name: 'Головна квартира',
    street: 'вул. Хрещатик',
    building: '1',
    apartment: '15',
    city: 'Київ',
    region: 'Київська область',
    addressType: 'apartment',
  },
  secondary: {
    id: 2,
    name: 'Дача',
    street: 'вул. Лісова',
    building: '15',
    apartment: '1',
    city: 'Бровари',
    region: 'Київська область',
    addressType: 'house',
  },
};

export const testMeters = {
  electricity: {
    id: 1,
    addressId: 1,
    utilityTypeId: 1,
    name: 'Електролічильник кухня',
    serialNumber: 'EL-001-2024',
    modelName: 'НІК 2102-02',
    location: 'Кухня',
    installationDate: '2023-01-15',
    isActive: true,
    serviceProviderId: 1,
    notes: '',
    photoUrl: null,
  },
  gas: {
    id: 2,
    addressId: 1,
    utilityTypeId: 2,
    name: 'Газовий лічильник',
    serialNumber: 'GS-001-2024',
    modelName: 'Самгаз G4',
    location: 'Коридор',
    installationDate: '2022-06-01',
    isActive: true,
    serviceProviderId: 2,
    notes: '',
    photoUrl: null,
  },
  coldWater: {
    id: 3,
    addressId: 1,
    utilityTypeId: 3,
    name: 'Холодна вода ванна',
    serialNumber: 'CW-001-2024',
    modelName: 'Новатор ЛК-15',
    location: 'Ванна кімната',
    installationDate: '2023-03-10',
    isActive: true,
    serviceProviderId: 3,
    notes: '',
    photoUrl: null,
  },
  hotWater: {
    id: 4,
    addressId: 1,
    utilityTypeId: 4,
    name: 'Гаряча вода ванна',
    serialNumber: 'HW-001-2024',
    modelName: 'Новатор ЛК-15',
    location: 'Ванна кімната',
    installationDate: '2023-03-10',
    isActive: true,
    serviceProviderId: 4,
    notes: '',
    photoUrl: null,
  },
  inactiveMeter: {
    id: 5,
    addressId: 1,
    utilityTypeId: 1,
    name: 'Старий електролічильник',
    serialNumber: 'EL-OLD-2020',
    modelName: 'СО-505',
    location: 'Коридор',
    installationDate: '2015-01-01',
    isActive: false,
    serviceProviderId: 1,
    notes: 'Замінений на новий',
    photoUrl: null,
  },
};

export const testReadings = {
  electricity: {
    id: 1,
    meterId: 1,
    value: 12750,
    previousValue: 12500,
    consumption: 250,
    readingDate: '2024-01-15',
    submissionDate: '2024-01-16',
    status: 'accepted',
    note: '',
  },
  gas: {
    id: 2,
    meterId: 2,
    value: 1520,
    previousValue: 1500,
    consumption: 20,
    readingDate: '2024-01-15',
    submissionDate: '2024-01-16',
    status: 'accepted',
    note: '',
  },
  water: {
    id: 3,
    meterId: 3,
    value: 365,
    previousValue: 350,
    consumption: 15,
    readingDate: '2024-01-15',
    submissionDate: '2024-01-16',
    status: 'accepted',
    note: '',
  },
  processing: {
    id: 4,
    meterId: 1,
    value: 13000,
    previousValue: 12750,
    consumption: 250,
    readingDate: '2024-02-15',
    submissionDate: '2024-02-16',
    status: 'processing',
    note: 'Очікує підтвердження',
  },
};

export const testProviders = [
  { id: 1, name: 'ДТЕК Київські електромережі', utilityTypeId: 1 },
  { id: 2, name: 'Київгаз', utilityTypeId: 2 },
  { id: 3, name: 'Київводоканал', utilityTypeId: 3 },
  { id: 4, name: 'Київенерго', utilityTypeId: 4 },
];

export function createMockAddressesResponse(addresses = [testAddresses.primary, testAddresses.secondary]) {
  return {
    data: addresses,
    pagination: {
      page: 1,
      pageSize: 10,
      totalCount: addresses.length,
      totalPages: 1,
    },
  };
}

export function createMockMetersResponse(meters = Object.values(testMeters).filter(m => m.isActive)) {
  return {
    data: meters,
  };
}

export function createMockReadingsResponse(readings = Object.values(testReadings)) {
  return {
    data: readings,
  };
}
