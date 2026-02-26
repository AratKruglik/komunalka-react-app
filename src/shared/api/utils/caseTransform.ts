function snakeToCamel(str: string): string {
  return str.replace(/_([a-z0-9])/g, (_, char: string) => char.toUpperCase())
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)
}

export function transformKeys(data: unknown, transform: (key: string) => string): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => transformKeys(item, transform))
  }

  if (isPlainObject(data)) {
    const result: Record<string, unknown> = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[transform(key)] = transformKeys(data[key], transform)
      }
    }
    return result
  }

  return data
}

export function snakeToCamelKeys<T>(data: unknown): T {
  return transformKeys(data, snakeToCamel) as T
}

export function camelToSnakeKeys(data: unknown): unknown {
  return transformKeys(data, camelToSnake)
}
