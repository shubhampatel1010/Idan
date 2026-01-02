import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Mail, Lock, ArrowLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const UserTable = import.meta.env.VITE_USERTABLE;



export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"sales" | "admin">("sales");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // todo: remove mock functionality
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter email and password",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
    let url = `https://api.airtable.com/v0/${BASE_ID}/${UserTable}`;
      const filter = `AND({Email}="${email}", {Password}="${password}", {Status}="Active")`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
        },
        params: {
          filterByFormula: filter,
          maxRecords: 1,
        },
      });

      // Check if record exists
      if (response.data.records && response.data.records.length > 0) {
    
        toast({
          title: "Welcome back!",
          description: `Signed in as Admin User`,
        });
        // localStorage.setItem("userData",response.data.records[0].fields);
        localStorage.setItem(
          "userData",
          JSON.stringify(response.data.records[0].fields)
        );


        navigate(`/dashboard`);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials or inactive user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="p-4">
        {/* <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link> */}
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary">
              <Briefcase className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl" data-testid="text-login-title">
              Admin Login
            </CardTitle>
            <CardDescription>For Admin team members</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Demo Credentials */}
            {/* <div className="mb-4 rounded-md border border-muted p-3 bg-muted text-sm text-muted-foreground">
              <strong>Demo Credentials:</strong>
              <p>Username: <code>admin</code></p>
              <p>Password: <code>admin123</code></p>
            </div> */}
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as "sales" | "admin")}
            >
              {/* <TabsList className="grid w-full">
                <TabsTrigger value="admin" data-testid="tab-admin">
                  Admin Login
                </TabsTrigger>
              </TabsList> */}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">UserName</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="Enter your username"
                      // placeholder="you@company.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      data-testid="input-password"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-login-submit"
                >
                  {isLoading
                    ? "Signing in..."
                    : `Sign in as Admin`}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
