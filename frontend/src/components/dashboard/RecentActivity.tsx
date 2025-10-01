import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivity as RecentActivityType } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Package,
  User,
} from "lucide-react";

interface RecentActivityProps {
  activities: RecentActivityType[];
  isLoading?: boolean;
}

const activityIcons = {
  form_created: FileText,
  form_submitted: CheckCircle,
  form_reviewed: CheckCircle,
  alert_created: AlertTriangle,
  product_created: Package,
};

export function RecentActivity({ activities, isLoading = false }: RecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted rounded" />
                  <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type] || User;
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.userName} • {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-8">
            No hay actividad reciente
          </div>
        )}
      </CardContent>
    </Card>
  );
}
