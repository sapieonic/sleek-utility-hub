
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchToolsProps {
  onSearch: (query: string) => void;
}

export function SearchTools({ onSearch }: SearchToolsProps) {
  const [query, setQuery] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search tools..."
        className="pl-10"
        value={query}
        onChange={handleChange}
      />
    </div>
  );
}
