import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

export function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className,
  onClear 
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setInternalValue('');
    onChange('');
    onClear?.();
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        className={cn(
          'pl-10',
          internalValue && 'pr-10'
        )}
      />
      {internalValue && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

interface SearchFiltersProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  tags: string[];
  selectedTags: string[];
  onTagChange: (tags: string[]) => void;
}

export function SearchFilters({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  tags, 
  selectedTags, 
  onTagChange 
}: SearchFiltersProps) {
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Categories</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Tags Filter */}
      {tags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                size="sm"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SearchResultsProps {
  query: string;
  items: any[];
  onItemSelect: (item: any) => void;
  isLoading?: boolean;
}

export function SearchResults({ query, items, onItemSelect, isLoading }: SearchResultsProps) {
  if (!query.trim()) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No results found for "{query}"</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-4">
        Found {items.length} result{items.length !== 1 ? 's' : ''} for "{query}"
      </p>
      {items.map((item) => (
        <div
          key={item.id}
          className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
          onClick={() => onItemSelect(item)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.username}</p>
              {item.category && (
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded mt-1 inline-block">
                  {item.category}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(item.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}