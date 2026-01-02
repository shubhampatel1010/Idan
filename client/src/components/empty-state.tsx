import { LucideIcon, Building2, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon: Icon = Search, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {action && (
        action.href ? (
          <Link to={action.href}>
            <Button data-testid="button-empty-action">{action.label}</Button>
          </Link>
        ) : (
          <Button onClick={action.onClick} data-testid="button-empty-action">
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}
