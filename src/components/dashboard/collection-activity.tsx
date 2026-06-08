"use client";

import { format, formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, FileText, AlertCircle } from "lucide-react";

interface Activity {
  id: string;
  type: "email" | "phone" | "letter" | "demand";
  customer: string;
  description: string;
  timestamp: string;
  user: string;
}

interface CollectionActivityProps {
  activities?: Activity[];
}

const defaultActivities: Activity[] = [
  { id: "1", type: "email", customer: "Acme Corp", description: "Payment reminder sent", timestamp: "2024-01-20T10:30:00Z", user: "John Smith" },
  { id: "2", type: "phone", customer: "TechStart Inc", description: "Follow-up call completed", timestamp: "2024-01-20T09:15:00Z", user: "Sarah Johnson" },
  { id: "3", type: "letter", customer: "Global Solutions", description: "Final demand letter sent", timestamp: "2024-01-19T16:45:00Z", user: "John Smith" },
  { id: "4", type: "demand", customer: "Digital Ventures", description: "Overdue notice issued", timestamp: "2024-01-19T14:20:00Z", user: "Mike Williams" },
  { id: "5", type: "email", customer: "Innovate Labs", description: "Payment plan proposal sent", timestamp: "2024-01-18T11:00:00Z", user: "Sarah Johnson" },
];

function getActivityIcon(type: string) {
  switch (type) {
    case "email":
      return <Mail className="h-4 w-4" />;
    case "phone":
      return <Phone className="h-4 w-4" />;
    case "letter":
      return <FileText className="h-4 w-4" />;
    case "demand":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Mail className="h-4 w-4" />;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case "email":
      return "bg-blue-100 text-blue-600";
    case "phone":
      return "bg-green-100 text-green-600";
    case "letter":
      return "bg-purple-100 text-purple-600";
    case "demand":
      return "bg-red-100 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function CollectionActivity({ activities = defaultActivities }: CollectionActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Collection Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.customer}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500">by {activity.user}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
