import { useState, useEffect } from "react";
import { Search, Lock, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { isUrl } from "@/lib/search";

interface AddressBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  isSecure?: boolean;
}

export function AddressBar({ value, onChange, onSubmit, isSecure }: AddressBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inputValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  const showUrl = isUrl(inputValue);

  return (
    <form onSubmit={handleSubmit} className="flex-1 max-w-3xl mx-4">
      <div
        className={cn(
          "relative flex items-center gap-2 px-4 py-2.5 rounded-full",
          "bg-secondary border border-border transition-all duration-200",
          isFocused && "ring-2 ring-primary/50 border-primary/50"
        )}
      >
        {/* Protocol Icon */}
        <div className="flex-shrink-0">
          {showUrl ? (
            isSecure ? (
              <Lock className="w-4 h-4 text-primary" />
            ) : (
              <Globe className="w-4 h-4 text-muted-foreground" />
            )
          ) : (
            <Search className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        {/* Input */}
        <Input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search or enter URL..."
          className={cn(
            "flex-1 border-0 bg-transparent p-0 h-auto",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/60"
          )}
        />
      </div>
    </form>
  );
}
