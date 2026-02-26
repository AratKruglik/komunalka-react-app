import type { MeterType } from '../constants/meterTypes'
import type { Meter } from '../types/entities'
import { UTILITY_TYPE_ID_TO_METER_TYPE } from '../types/entities'

const UTILITY_SLUG_TO_METER_TYPE: Record<string, MeterType> = {
  electricity: 'electricity',
  gas: 'gas',
  cold_water: 'coldWater',
  coldwater: 'coldWater',
  hot_water: 'hotWater',
  hotwater: 'hotWater',
  heat: 'heat',
  heating: 'heat',
}

// TODO(human): implement getMeterTypeFromMeter
export function getMeterTypeFromMeter(meter: Meter): MeterType {
  throw new Error('Not implemented')
}
