export const TestAddresses = {
  new: {
    propertyType: 'apartment' as const,
    region: 'Київська область',
    city: 'Київ',
    street: 'Тестова вулиця',
    buildingNumber: '123',
    unitNumber: '45',
    postalCode: '01001',
    notes: 'Тестова адреса для E2E тестів',
  },
  updated: {
    city: 'Бровари',
    street: 'Оновлена вулиця',
  },
}

export const TestMeters = {
  electricity: {
    type: 'electricity' as const,
    serialNumber: 'TEST-ELEC-123456',
    installationLocation: 'Коридор біля входу',
    manufacturer: 'Тестовий виробник',
    initialReading: '100',
    tariffValue: '2.64',
  },
  gas: {
    type: 'gas' as const,
    serialNumber: 'TEST-GAS-654321',
    installationLocation: 'Кухня',
    manufacturer: 'Газовий виробник',
    initialReading: '50',
    tariffValue: '7.96',
  },
}

export const TestReadings = {
  electricity: {
    currentValue: '150',
    expectedConsumption: 50,
  },
  gas: {
    currentValue: '75',
    expectedConsumption: 25,
  },
}

export const InvalidCredentials = {
  email: 'invalid@test.com',
  password: 'wrongpassword123',
}

export const ValidationErrors = {
  emptyEmail: "Електронна пошта обов'язкова",
  invalidEmail: 'Невірний формат електронної пошти',
  emptyPassword: "Пароль обов'язковий",
  shortPassword: 'Пароль повинен містити мінімум 6 символів',
  loginFailed: 'Помилка входу',
}

export const UIText = {
  buttons: {
    login: 'Увійти',
    logout: 'Вийти',
    save: 'Зберегти',
    cancel: 'Скасувати',
    addAddress: 'Додати адресу',
    saveAddress: 'Зберегти адресу',
    addMeter: 'Додати лічильник',
    saveMeter: 'Зберегти лічильник',
    saveReading: 'Зберегти',
  },
  pageHeadings: {
    dashboard: 'Головна',
    addresses: 'Мої адреси',
    addAddress: 'Додати нову адресу',
    meters: 'Лічильники за адресою',
    addMeter: 'Додати новий лічильник',
    readings: 'Внести показання',
    profile: 'Профіль',
  },
  propertyTypes: {
    apartment: 'Квартира',
    house: 'Приватний будинок',
    office: 'Офіс',
  },
  meterTypes: {
    electricity: 'Електроенергія',
    gas: 'Газ',
    coldWater: 'Холодна вода',
    hotWater: 'Гаряча вода',
  },
}
