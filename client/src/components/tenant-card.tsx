import { User, Send, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import type { TenantMatch } from "@/lib/types";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TenantCardProps {
  match: TenantMatch;
  onSend: (tenantId: string, existingNotes?: string) => void;
  isSending: boolean;
  isSent: boolean;
}

export function TenantCard({
  match,
  onSend,
  isSending,
  isSent,
}: TenantCardProps) {
  const { tenant, matchPercentage, matchedCriteria } = match;
  const fullName = tenant.Full_Name || "Unknown Tenant";
  const email = tenant.Email || "No email";
  const budgetMin = tenant.Budget_Min_ILS ?? 0;
  const budgetMax = tenant.Budget_Max_ILS ?? 0;
  const minBeds = tenant.Min_Bedrooms ?? 0;
  const maxBeds = tenant.Max_Bedrooms ?? 0;
  const moveInDate = tenant.Move_In_Date;
  const employmentStatus = tenant.Employment_Status || "Not specified";
  const Message = tenant.Message || "";
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "T";

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-muted-foreground";
  };

  function formatMessageForUI(message: string) {
    if (!message) return null;

    const lines = message.split("\n");

    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          // Title
          if (index === 0 && line.trim()) {
            return (
              <p key={index} className="font-semibold">
                {line}
              </p>
            );
          }

          // Timestamp
          if (line.startsWith("[") && line.endsWith("]")) {
            return (
              <p key={index} className="text-xs text-muted-foreground">
                {line}
              </p>
            );
          }

          // URL
          if (line.startsWith("URL:")) {
            const url = line.replace("URL:", "").trim();
            return (
              <button
                key={index}
                onClick={() => navigate(url)}
                className="text-primary underline break-all text-left"
              >
                {url}
              </button>
            );
          }

          // Default text
          return (
            <p key={index} className="text-sm">
              {line}
            </p>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden" data-testid={`card-tenant-${tenant.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-border">
            <AvatarImage src={tenant.Profile_Photo} alt={fullName} />
            <AvatarFallback>
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3
                  className="font-semibold text-lg"
                  data-testid={`text-tenant-name-${tenant.id}`}
                >
                  {fullName}
                </h3>
                <p className="text-sm text-muted-foreground">{email}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div
                  className={`text-2xl font-bold ${getMatchColor(
                    matchPercentage
                  )}`}
                  data-testid={`text-match-percentage-${tenant.id}`}
                >
                  {matchPercentage}%
                </div>
                <p className="text-xs text-muted-foreground">Match</p>
              </div>
            </div>

            <div className="mb-3">
              <Progress value={matchPercentage} className="h-2" />
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {matchedCriteria.map((criteria) => (
                <Badge key={criteria} variant="secondary" className="text-xs">
                  {criteria}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
              <div>
                <span className="font-medium text-foreground">Budget:</span>{" "}
                {budgetMin.toLocaleString()} - {budgetMax.toLocaleString()} ILS
              </div>
              <div>
                <span className="font-medium text-foreground">Bedrooms:</span>{" "}
                {minBeds} - {maxBeds}
              </div>
              <div>
                <span className="font-medium text-foreground">Move-in:</span>{" "}
                {moveInDate
                  ? new Date(moveInDate).toLocaleDateString()
                  : "Flexible"}
              </div>
              <div>
                <span className="font-medium text-foreground">Status:</span>{" "}
                {employmentStatus}
              </div>
            </div>
            {!isSent && (
              <>
                <Button
                  onClick={() => onSend(tenant.id, tenant.Notes)}
                  disabled={isSending || isSent}
                  className="w-full"
                  variant={isSent ? "secondary" : "default"}
                  data-testid={`button-send-${tenant.id}`}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : isSent ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Sent
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </>
            )}
            {isSent && (
              <div className="relative rounded-md border bg-muted p-3 mt-2 text-sm whitespace-pre-line">
                {/* Copy Button */}
                <button
                  onClick={() => Message && handleCopy(Message)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                  title="Copy message"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>

                {/* Message */}
                {formatMessageForUI(Message)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
