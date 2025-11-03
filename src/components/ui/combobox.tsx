"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxOption {
  value: string;
  label: string;
  render?: React.ReactNode; // Optional custom render for the option in the dropdown
  triggerLabel?: React.ReactNode; // Optional custom render for the trigger button
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  shouldFilter?: boolean; // Whether to filter options client-side
  onSearchChange?: (search: string) => void; // Callback for API-based search
  searchValue?: string; // Controlled search value for API-based search
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  emptyMessage = "No option found.",
  searchPlaceholder = "Search...",
  disabled = false,
  className,
  isLoading = false,
  shouldFilter = true,
  onSearchChange,
  searchValue,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [internalSearch, setInternalSearch] = React.useState("");

  const selectedOption = options.find((option) => option.value === value);
  const displaySearchValue =
    searchValue !== undefined ? searchValue : internalSearch;

  const handleSearchChange = (search: string) => {
    if (onSearchChange) {
      onSearchChange(search);
    } else {
      setInternalSearch(search);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-11 text-left font-normal",
            !selectedOption && "text-gray-500",
            className
          )}
          disabled={disabled || isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              <span>Loading...</span>
            </>
          ) : selectedOption ? (
            <span className="block truncate text-sm">
              {selectedOption.triggerLabel || selectedOption.label}
            </span>
          ) : (
            <span className="block truncate text-sm text-gray-500">
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] bg-white p-0 shadow-lg border border-gray-200 overflow-hidden"
        align="start"
        side="bottom"
      >
        <Command
          shouldFilter={shouldFilter}
          className="max-h-[350px] flex flex-col w-full"
        >
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-10 border-b shrink-0 w-full"
            value={displaySearchValue}
            onValueChange={handleSearchChange}
          />
          <CommandList className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden w-full">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : (
              <>
                <CommandEmpty className="py-6 text-center text-sm text-gray-500">
                  {emptyMessage}
                </CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        onValueChange?.(
                          currentValue === value ? "" : currentValue
                        );
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1 text-sm min-w-0 max-w-full">
                        {option.render || (
                          <span className="truncate block max-w-full">
                            {option.label}
                          </span>
                        )}
                      </div>
                      <Check
                        className={cn(
                          "ml-2 h-4 w-4 shrink-0 text-green-600",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
