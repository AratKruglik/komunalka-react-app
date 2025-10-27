import type { AddressBadge, AddressServiceTag } from './AddressCard'
import { Star } from 'lucide-react'

export type AddressCardData = {
  id: string
  title: string
  subtitle: string
  badges: AddressBadge[]
  services: AddressServiceTag[]
  isPrimary?: boolean
}

export const mockAddressCards: AddressCardData[] = [
  {
    id: 'khreshchatyk',
    title: 'вул. Хрещатик, 22, кв. 15',
    subtitle: 'м. Київ, Шевченківський район',
    badges: [
      { label: 'Основна адреса', variant: 'primary' },
      { label: '4 лічильники', variant: 'muted' },
    ],
    services: [
      { label: 'Електроенергія' },
      { label: 'Газ' },
      { label: 'Холодна вода' },
      { label: 'Гаряча вода' },
    ],
    isPrimary: true,
  },
  {
    id: 'darnytska',
    title: 'вул. Дарницька, 5, кв. 42',
    subtitle: 'м. Київ, Дарницький район',
    badges: [
      { label: 'Зробити основною', variant: 'outline', icon: Star },
      { label: '2 лічильники', variant: 'muted' },
    ],
    services: [
      { label: 'Електроенергія' },
      { label: 'Газ' },
    ],
  },
  {
    id: 'nezalezhnosti',
    title: 'вул. Незалежності, 10, кв. 7',
    subtitle: 'м. Львів, Шевченківський район',
    badges: [
      { label: 'Зробити основною', variant: 'outline', icon: Star },
      { label: '3 лічильники', variant: 'muted' },
    ],
    services: [
      { label: 'Електроенергія' },
      { label: 'Газ' },
      { label: 'Холодна вода' },
    ],
  },
  {
    id: 'prorizna',
    title: 'вул. Прорізна, 18, кв. 101',
    subtitle: 'м. Київ, Печерський район',
    badges: [
      { label: 'Зробити основною', variant: 'outline', icon: Star },
      { label: '3 лічильники', variant: 'muted' },
    ],
    services: [
      { label: 'Електроенергія' },
      { label: 'Холодна вода' },
      { label: 'Гаряча вода' },
    ],
  },
  {
    id: 'sumska',
    title: 'вул. Сумська, 64, кв. 23',
    subtitle: 'м. Харків, Дзержинський район',
    badges: [
      { label: 'Зробити основною', variant: 'outline', icon: Star },
      { label: '4 лічильники', variant: 'muted' },
    ],
    services: [
      { label: 'Електроенергія' },
      { label: 'Газ' },
      { label: 'Холодна вода' },
      { label: 'Гаряча вода' },
    ],
  },
  {
    id: 'deribasivska',
    title: 'вул. Дерибасівська, 12, кв. 5',
    subtitle: 'м. Одеса, Приморський район',
    badges: [
      { label: 'Зробити основною', variant: 'outline', icon: Star },
      { label: '2 лічильники', variant: 'muted' },
    ],
    services: [
      { label: 'Електроенергія' },
      { label: 'Холодна вода' },
    ],
  },
  {
    id: 'shevchenka',
    title: 'вул. Шевченка, 45, кв. 88',
    subtitle: 'м. Дніпро, Центральний район',
    badges: [
      { label: 'Зробити основною', variant: 'outline', icon: Star },
      { label: '3 лічильники', variant: 'muted' },
    ],
    services: [
      { label: 'Електроенергія' },
      { label: 'Газ' },
      { label: 'Гаряча вода' },
    ],
  },
  {
    id: 'sichovyh-striltsiv',
    title: 'вул. Січових Стрільців, 33, кв. 12',
    subtitle: 'м. Львів, Галицький район',
    badges: [
      { label: 'Зробити основною', variant: 'outline', icon: Star },
      { label: '5 лічильників', variant: 'muted' },
    ],
    services: [
      { label: 'Електроенергія' },
      { label: 'Газ' },
      { label: 'Холодна вода' },
      { label: 'Гаряча вода' },
      { label: 'Опалення' },
    ],
  },
  {
    id: 'bandery',
    title: 'просп. Бандери, 28, кв. 56',
    subtitle: 'м. Київ, Оболонський район',
    badges: [
      { label: 'Зробити основною', variant: 'outline', icon: Star },
      { label: '2 лічильники', variant: 'muted' },
    ],
    services: [
      { label: 'Електроенергія' },
      { label: 'Газ' },
    ],
  },
  {
    id: 'soborna',
    title: 'вул. Соборна, 7, кв. 34',
    subtitle: 'м. Вінниця, Ленінський район',
    badges: [
      { label: 'Зробити основною', variant: 'outline', icon: Star },
      { label: '3 лічильники', variant: 'muted' },
    ],
    services: [
      { label: 'Електроенергія' },
      { label: 'Холодна вода' },
      { label: 'Гаряча вода' },
    ],
  },
  {
    id: 'heroiv-krut',
    title: 'вул. Героїв Крут, 51, кв. 19',
    subtitle: 'м. Полтава, Київський район',
    badges: [
      { label: 'Зробити основною', variant: 'outline', icon: Star },
      { label: '4 лічильники', variant: 'muted' },
    ],
    services: [
      { label: 'Електроенергія' },
      { label: 'Газ' },
      { label: 'Холодна вода' },
      { label: 'Гаряча вода' },
    ],
  },
  {
    id: 'mazepy',
    title: 'вул. Мазепи, 15, кв. 3',
    subtitle: 'м. Чернігів, Деснянський район',
    badges: [
      { label: 'Зробити основною', variant: 'outline', icon: Star },
      { label: '2 лічильники', variant: 'muted' },
    ],
    services: [
      { label: 'Електроенергія' },
      { label: 'Холодна вода' },
    ],
  },
]
