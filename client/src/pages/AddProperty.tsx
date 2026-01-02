import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layout } from "@/components/layout";
import { createProperty } from "../lib/airtable";

export default function AddProperty() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    Property_ID: "",
    Property_Name: "",
    Address: "",
    Neighborhood: "",
    Property_Type: "",
    Bedrooms: 0,
    Bathrooms: 0,
    Square_Meters: 0,
    Monthly_Rent_ILS: 0,
    Available_From: "",
    Furnished: "",
    Balcony: "",
    Parking: "",
    Pets_Allowed: "",
    Floor: 0,
    Building_Floors: 0,
    Elevator: "",
    Air_Conditioning: "",
    Property_Images: "",
    Description: "",
    Status: "Available",
    Date_Added: new Date().toISOString(),
  });

  const setField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await createProperty(form);

      toast({
        title: "Property Added",
        description: "Saved to Airtable successfully",
      });

      navigate("/properties");
    } catch {
      toast({
        title: "Error",
        description: "Failed to save property",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto mt-8">
        <Card>
          <CardContent className="p-6 space-y-5">
            <h2 className="text-2xl font-semibold">Add Property</h2>

            {/* TEXT FIELDS */}
            <Input
              placeholder="Property ID"
              onChange={(e) => setField("Property_ID", e.target.value)}
            />
            <Input
              placeholder="Property Name"
              onChange={(e) => setField("Property_Name", e.target.value)}
            />
            <Input
              placeholder="Address"
              onChange={(e) => setField("Address", e.target.value)}
            />
            <Input
              placeholder="Neighborhood"
              onChange={(e) => setField("Neighborhood", e.target.value)}
            />
            <Select onValueChange={(value) => setField("Property_Type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Studio">Studio</SelectItem>
                <SelectItem value="Penthouse">Penthouse</SelectItem>
                <SelectItem value="Duplex">Duplex</SelectItem>
                <SelectItem value="Loft">Loft</SelectItem>
                <SelectItem value="Garden Apartment">
                  Garden Apartment
                </SelectItem>
                <SelectItem value="Penthouse">Penthouse</SelectItem>
                <SelectItem value="House">House</SelectItem>
              </SelectContent>
            </Select>

            {/* NUMBER FIELDS */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Bedrooms"
                onChange={(e) => setField("Bedrooms", Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Bathrooms"
                onChange={(e) => setField("Bathrooms", Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Square Meters"
                onChange={(e) =>
                  setField("Square_Meters", Number(e.target.value))
                }
              />
              <Input
                type="number"
                placeholder="Monthly Rent (ILS)"
                onChange={(e) =>
                  setField("Monthly_Rent_ILS", Number(e.target.value))
                }
              />
              <Input
                type="number"
                placeholder="Floor"
                onChange={(e) => setField("Floor", Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Building Floors"
                onChange={(e) =>
                  setField("Building_Floors", Number(e.target.value))
                }
              />
            </div>

            {/* DATE */}
            <Input
              type="date"
              onChange={(e) => setField("Available_From", e.target.value)}
            />

            {/* CHECKBOX FIELDS */}
            <div className="grid grid-cols-3 gap-4">
              {[
                ["Furnished", "Furnished"],
                ["Balcony", "Balcony"],
                ["Parking", "Parking"],
                ["Pets_Allowed", "Pets Allowed"],
                ["Elevator", "Elevator"],
                ["Air_Conditioning", "Air Conditioning"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={(form[key as keyof typeof form] as string) === "checked"}
                    onCheckedChange={
                      (v) => setField(key, v ? "checked" : "") // convert to string
                    }
                  />
                  {label}
                </label>
              ))}
            </div>

            {/* IMAGE */}
            <Input
              placeholder="Property Image URL"
              onChange={(e) => setField("Property_Images", e.target.value)}
            />

            {/* DESCRIPTION */}
            <Textarea
              placeholder="Description"
              rows={4}
              onChange={(e) => setField("Description", e.target.value)}
            />

            {/* STATUS */}
            <Select
              defaultValue="Available"
              onValueChange={(value) => setField("Status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Rented">Rented</SelectItem>
                <SelectItem value="Under Maintenance">
                  Under Maintenance
                </SelectItem>
              </SelectContent>
            </Select>

            {/* ACTIONS */}
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleSave}>
                Save Property
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => navigate("/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
