import { useRef, useState } from 'react'
import type {
  ChangeEvent,
  DragEvent,
  InputHTMLAttributes,
  MutableRefObject,
  ReactNode,
} from 'react'
import { Button } from '../Button'

interface InputPropsWithRef extends InputHTMLAttributes<HTMLInputElement> {
  ref?: ((element: HTMLInputElement | null) => void) | MutableRefObject<HTMLInputElement | null>
}

export interface PhotoDropzoneProps {
  id: string
  className?: string
  fileName?: string | null
  previewUrl?: string | null
  emptyIcon?: ReactNode
  emptyTitle?: ReactNode
  emptyDescription?: ReactNode
  helperText?: ReactNode
  buttonLabel?: string
  clearLabel?: string
  onFilesSelected?: (files: FileList | null) => void
  onClear?: () => void
  inputProps?: InputPropsWithRef
  previewHeight?: number
}

export function PhotoDropzone({
  id,
  className = '',
  fileName,
  previewUrl,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  helperText,
  buttonLabel = 'Завантажити фото',
  clearLabel = 'Видалити фото',
  onFilesSelected,
  onClear,
  inputProps,
  previewHeight = 260,
}: PhotoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const hasPreview = Boolean(previewUrl)

  const { ref: externalRef, onChange: externalOnChange, ...restInputProps } = inputProps ?? {}

  const assignRef = (element: HTMLInputElement | null) => {
    inputRef.current = element
    if (!externalRef) {
      return
    }

    if (typeof externalRef === 'function') {
      externalRef(element)
      return
    }

    externalRef.current = element
  }

  const emitFiles = (files: FileList | null) => {
    onFilesSelected?.(files)
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    externalOnChange?.(event)
    emitFiles(event.target.files ?? null)
    setIsDragActive(false)
  }

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragActive(false)
    }
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragActive(false)
    const files = event.dataTransfer?.files?.length ? event.dataTransfer.files : null
    if (!files) {
      return
    }

    emitFiles(files)
  }

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onClear?.()
  }

  return (
    <label
      htmlFor={id}
      className={[
        'flex min-h-[220px] cursor-pointer flex-col gap-3 rounded-xl border-2 border-dashed px-4 text-gray-600 transition',
        isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5',
        hasPreview ? 'items-stretch text-left' : 'items-center text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {hasPreview ? (
        <div className="flex w-full flex-col gap-3">
          <div className="w-full rounded-lg border border-gray-200 bg-white shadow-inner">
            <div className="w-full overflow-hidden rounded-lg bg-gray-50" style={{ minHeight: previewHeight }}>
              <img
                src={previewUrl ?? ''}
                alt={fileName ?? 'Превʼю фото'}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 sm:text-left">
            <p className="text-sm font-medium text-gray-800">{fileName}</p>
            {helperText ? <p className="text-xs text-gray-500">{helperText}</p> : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            tone="neutral"
            size="sm"
            className="self-center sm:self-start"
            onClick={(event) => {
              event.preventDefault()
              handleClear()
            }}
          >
            {clearLabel}
          </Button>
        </div>
      ) : (
        <>
          {emptyIcon}
          {emptyTitle ? (
            <p className="text-base font-medium text-gray-800">{emptyTitle}</p>
          ) : null}
          {emptyDescription ? (
            <p className="text-sm text-gray-500">{emptyDescription}</p>
          ) : null}
          {buttonLabel ? (
            <Button type="button" variant="outline" tone="neutral" size="sm" className="pointer-events-none">
              {buttonLabel}
            </Button>
          ) : null}
        </>
      )}
      <input
        id={id}
        type="file"
        className="sr-only"
        onChange={handleInputChange}
        ref={(element) => assignRef(element)}
        {...restInputProps}
      />
    </label>
  )
}
