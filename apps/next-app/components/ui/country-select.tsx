'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { countryCodes, type CountryCode } from "@libs/validators/user"

interface CountrySelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function CountrySelect({
  value,
  onValueChange,
  placeholder = "选择国家/地区",
  disabled = false,
  className,
}: CountrySelectProps) {
  const selectedCountry = countryCodes.find((country) => country.code === value)

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn("w-[140px]", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedCountry && (
            <div className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="text-sm">{selectedCountry.code}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {countryCodes.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <div className="flex items-center gap-3">
              <span className="text-lg">{country.flag}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{country.name}</span>
                <span className="text-sm text-muted-foreground">{country.code}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 