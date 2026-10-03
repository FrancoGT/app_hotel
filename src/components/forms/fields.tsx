"use client"

import type React from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

// Campos de formulario compartidos por los formularios del panel de administración

const CONTROL_CLASS =
  "w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"

const LABEL_CLASS = "text-xs font-medium text-[var(--color-600)]"

type ChangeHandler = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void

interface FieldWrapperProps {
  label: string
  htmlFor: string
  hint?: ReactNode
  children: ReactNode
}

function FieldWrapper({ label, htmlFor, hint, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className={LABEL_CLASS}>
        {label}
      </label>
      {children}
      {hint}
    </div>
  )
}

type InputFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string
  name: string
  onChange: ChangeHandler
  hint?: ReactNode
}

export function FormField({ label, name, hint, className, ...props }: InputFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={name} hint={hint}>
      <input id={name} name={name} className={cn(CONTROL_CLASS, className)} {...props} />
    </FieldWrapper>
  )
}

type TextAreaFieldProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> & {
  label: string
  name: string
  onChange: ChangeHandler
}

export function TextAreaField({ label, name, rows = 3, ...props }: TextAreaFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={name}>
      <textarea id={name} name={name} rows={rows} className={CONTROL_CLASS} {...props} />
    </FieldWrapper>
  )
}

type SelectFieldProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  label: string
  name: string
  onChange: ChangeHandler
  options: { value: string | number; label: string }[]
  // Opción vacía inicial ("-- Seleccione --")
  placeholder?: string
  loading?: boolean
}

export function SelectField({ label, name, options, placeholder, loading, ...props }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} htmlFor={name}>
      {loading ? (
        <p className="text-xs text-gray-400">Cargando opciones...</p>
      ) : (
        <select id={name} name={name} className={CONTROL_CLASS} {...props}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </FieldWrapper>
  )
}

interface CheckboxFieldProps {
  label: string
  name: string
  checked: boolean
  onChange: ChangeHandler
}

export function CheckboxField({ label, name, checked, onChange }: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={name}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--primary-color)] cursor-pointer"
      />
      <label htmlFor={name} className="text-xs text-[var(--color-700)] cursor-pointer select-none">
        {label}
      </label>
    </div>
  )
}

interface FormSectionProps {
  title: string
  // "plain": sin fondo; "boxed": tarjeta gris; o una clase propia para secciones destacadas
  variant?: "plain" | "boxed"
  className?: string
  titleClassName?: string
  children: ReactNode
}

export function FormSection({ title, variant = "plain", className, titleClassName, children }: FormSectionProps) {
  return (
    <section
      className={cn(
        "space-y-4",
        variant === "boxed" && "bg-slate-50 p-4 rounded-xl border border-slate-200",
        className
      )}
    >
      <h3 className={cn("text-xs font-bold uppercase text-[var(--color-400)] tracking-wider", titleClassName)}>
        {title}
      </h3>
      {children}
    </section>
  )
}

interface CrudFormProps {
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  isSaving: boolean
  children: ReactNode
}

// <form> con scroll interno y botones Cancelar/Guardar fijos al pie
export function CrudForm({ onSubmit, onCancel, isSaving, children }: CrudFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {children}
      <div className="pt-4 flex justify-end gap-2 sticky bottom-0 bg-[var(--card-color)] pb-2 border-t border-[var(--border-color)] mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-xl border border-[var(--border-color)] px-4 py-2 text-xs font-medium text-[var(--dark-color)] hover:bg-[var(--body-color)]/60 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-xl bg-[var(--primary-color)] px-4 py-2 text-xs font-medium text-white hover:brightness-110 disabled:opacity-70"
        >
          {isSaving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  )
}

