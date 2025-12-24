import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  timeFilter: string;
  onTimeFilterChange: (filter: string) => void;
  accountFilter: string;
  onAccountFilterChange: (filter: string) => void;
}

const timeFilters = [
  { value: 'all', label: 'All Time' },
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'yearly', label: 'This Year' },
];

export const FilterBar = ({
  searchQuery,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  accountFilter,         // kept to avoid breaking parent props
  onAccountFilterChange, // kept to avoid breaking parent props
}: FilterBarProps) => {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search transactions..."
          className="input-glass rounded-xl pl-9"
        />
      </div>

      {/* Time Filters Only */}
      <div className="flex flex-wrap gap-1.5">
        {timeFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={timeFilter === filter.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTimeFilterChange(filter.value)}
            className={cn(
              'rounded-lg text-xs h-8',
              timeFilter === filter.value && 'shadow-md'
            )}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

// import { Search } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { cn } from '@/lib/utils';

// interface FilterBarProps {
//   searchQuery: string;
//   onSearchChange: (query: string) => void;
//   timeFilter: string;
//   onTimeFilterChange: (filter: string) => void;
//   accountFilter: string;
//   onAccountFilterChange: (filter: string) => void;
// }

// const timeFilters = [
//   { value: 'all', label: 'All Time' },
//   { value: 'daily', label: 'Today' },
//   { value: 'weekly', label: 'This Week' },
//   { value: 'monthly', label: 'This Month' },
//   { value: 'yearly', label: 'This Year' },
// ];

// export const FilterBar = ({
//   searchQuery,
//   onSearchChange,
//   timeFilter,
//   onTimeFilterChange,
//   accountFilter,
//   onAccountFilterChange,
// }: FilterBarProps) => {
//   return (
//     <div className="glass-card rounded-2xl p-4 space-y-4">
//       <div className="relative">
//         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//         <Input
//           value={searchQuery}
//           onChange={(e) => onSearchChange(e.target.value)}
//           placeholder="Search transactions..."
//           className="input-glass rounded-xl pl-9"
//         />
//       </div>

//       <div className="flex flex-wrap gap-2">
//         <div className="flex flex-wrap gap-1.5">
//           {timeFilters.map((filter) => (
//             <Button
//               key={filter.value}
//               variant={timeFilter === filter.value ? 'default' : 'ghost'}
//               size="sm"
//               onClick={() => onTimeFilterChange(filter.value)}
//               className={cn(
//                 'rounded-lg text-xs h-8',
//                 timeFilter === filter.value && 'shadow-md'
//               )}
//             >
//               {filter.label}
//             </Button>
//           ))}
//         </div>

//         <div className="ml-auto">
//           <Select value={accountFilter} onValueChange={onAccountFilterChange}>
//             <SelectTrigger className="input-glass rounded-lg h-8 w-28 text-xs">
//               <SelectValue placeholder="Account" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All</SelectItem>
//               <SelectItem value="cash">Cash</SelectItem>
//               <SelectItem value="bank">Bank</SelectItem>
//               <SelectItem value="wallet">Wallet</SelectItem>
//             </SelectContent>
//           </Select>
//         </div> 
//       </div>
//     </div>
//   );
// };
