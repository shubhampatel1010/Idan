import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading";
import { ErrorState } from "@/components/error-state";

import { fetchPropertyById } from "@/lib/airtable";
import type { Property } from "@/lib/types";

// =====================
// INPUT FIELD (OUTSIDE)
// =====================
const InputField = ({
  label,
  field,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  field: string;
  type?: string;
  value: any;
  onChange: (field: string, value: any) => void;
}) => (
  <div className="space-y-1">
    <label className="text-sm font-medium">{label}</label>

    <input
      type={type}
      className="w-full border rounded p-2"
      value={type === "date" && value ? value.split("T")[0] : (value ?? "")}
      onChange={(e) =>
        onChange(
          field,
          type === "number" ? Number(e.target.value) : e.target.value,
        )
      }
    />
  </div>
);

export default function PropertyEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: property,
    isLoading,
    error,
  } = useQuery<Property>({
    queryKey: ["/api/property", id],
    queryFn: () => fetchPropertyById(id!),
    enabled: !!id,
  });

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (property) setForm(property);
  }, [property]);

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  // ---------- Select Field ----------
  const SelectField = ({
    label,
    field,
    options,
  }: {
    label: string;
    field: string;
    options: string[];
  }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <select
        className="w-full border rounded p-2"
        value={form[field] || ""}
        onChange={(e) => handleChange(field, e.target.value)}
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );

  // ---------- Loading / Error ----------
  if (isLoading)
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );

  if (error || !property)
    return (
      <Layout>
        <ErrorState message="Failed to load property" />
      </Layout>
    );

  // ---------- DIRECT UPDATE FUNCTION ----------
  // ---------- DIRECT UPDATE FIELD-WISE ----------
  const updatePropertyDirect = async (recordId: string, data: any) => {
    // Build fields object column-by-column
    const fields: any = {};

    if (data.Meeting_Date !== undefined)
      fields.Meeting_Date = data.Meeting_Date;
    if (data.Agent !== undefined) fields.Agent = data.Agent;
    if (data.Meeting_Location !== undefined)
      fields.Meeting_Location = data.Meeting_Location;
    if (data.Property_owner_name !== undefined)
      fields.Property_owner_name = data.Property_owner_name;
    if (data.Phone_Number !== undefined)
      fields.Phone_Number = data.Phone_Number;
    if (data.Email !== undefined) fields.Email = data.Email;
    if (data.Who_are_you_dealing_with !== undefined)
      fields.Who_are_you_dealing_with = data.Who_are_you_dealing_with;
    if (data.Property_Address !== undefined)
      fields.Property_Address = data.Property_Address;
    if (data.In_which_area_is_the_property !== undefined)
      fields.In_which_area_is_the_property = data.In_which_area_is_the_property;
    if (data.Floor !== undefined) fields.Floor = data.Floor;
    if (data.How_many_floors_in_the_building !== undefined)
      fields.How_many_floors_in_the_building =
        data.How_many_floors_in_the_building;
    if (data.How_many_apartments_in_the_building !== undefined)
      fields.How_many_apartments_in_the_building =
        data.How_many_apartments_in_the_building;
    if (data.Area_registered_in_Arnona !== undefined)
      fields.Area_registered_in_Arnona = data.Area_registered_in_Arnona;
    if (data.Actual_area !== undefined) fields.Actual_area = data.Actual_area;
    if (data.How_many_rooms !== undefined)
      fields.How_many_rooms = data.How_many_rooms;
    if (data.Air_directions !== undefined)
      fields.Air_directions = data.Air_directions;
    if (data.Elevator !== undefined) fields.Elevator = data.Elevator;
    if (data.Parking_Type !== undefined)
      fields.Parking_Type = data.Parking_Type;
    if (data.Can_I_get_a_parking_permit !== undefined)
      fields.Can_I_get_a_parking_permit = data.Can_I_get_a_parking_permit;
    if (data.Public_car_park_is_the_closest !== undefined)
      fields.Public_car_park_is_the_closest =
        data.Public_car_park_is_the_closest;
    if (data.Is_there_a_balcony !== undefined)
      fields.Is_there_a_balcony = data.Is_there_a_balcony;
    if (data.Balcony_type !== undefined)
      fields.Balcony_type = data.Balcony_type;
    if (data.Balcony_size !== undefined)
      fields.Balcony_size = data.Balcony_size;
    if (data.Storage !== undefined) fields.Storage = data.Storage;
    if (data.The_condition_of_the_apartment !== undefined)
      fields.The_condition_of_the_apartment =
        data.The_condition_of_the_apartment;
    if (data.The_level_of_maintenance_in_the_apartment !== undefined)
      fields.The_level_of_maintenance_in_the_apartment =
        data.The_level_of_maintenance_in_the_apartment;
    if (data.Furniture !== undefined) fields.Furniture = data.Furniture;
    if (data.Air_conditioning !== undefined)
      fields.Air_conditioning = data.Air_conditioning;
    if (data.Gas_connection !== undefined)
      fields.Gas_connection = data.Gas_connection;
    if (data.Accessibility_to_properties !== undefined)
      fields.Accessibility_to_properties = data.Accessibility_to_properties;
    if (data.Is_the_apartment_available !== undefined)
      fields.Is_the_apartment_available = data.Is_the_apartment_available;
    if (data.Entry_date !== undefined) fields.Entry_date = data.Entry_date;
    if (data.Quiet_street !== undefined)
      fields.Quiet_street = data.Quiet_street;
    if (data.Year_of_construction !== undefined)
      fields.Year_of_construction = data.Year_of_construction;
    if (data.The_level_of_maintenance_in_the_building !== undefined)
      fields.The_level_of_maintenance_in_the_building =
        data.The_level_of_maintenance_in_the_building;
    if (data.Is_TAMA_attached !== undefined)
      fields.Is_TAMA_attached = data.Is_TAMA_attached;
    if (data.Is_the_building_in_the_process_of_TAMA !== undefined)
      fields.Is_the_building_in_the_process_of_TAMA =
        data.Is_the_building_in_the_process_of_TAMA;
    if (data.When_is_the_TAMA_expected !== undefined)
      fields.When_is_the_TAMA_expected = data.When_is_the_TAMA_expected;
    if (data.Committee_of_the_House !== undefined)
      fields.Committee_of_the_House = data.Committee_of_the_House;
    if (data.Bi_monthly_municipal_taxes !== undefined)
      fields.Bi_monthly_municipal_taxes = data.Bi_monthly_municipal_taxes;
    if (data.Payment_term !== undefined)
      fields.Payment_term = data.Payment_term;
    if (data.A_bank_guarantee !== undefined)
      fields.A_bank_guarantee = data.A_bank_guarantee;
    if (data.A_security_note_for_the_sum !== undefined)
      fields.A_security_note_for_the_sum = data.A_security_note_for_the_sum;
    if (data.Guarantors_to_the_contract !== undefined)
      fields.Guarantors_to_the_contract = data.Guarantors_to_the_contract;
    if (data.Contract_term !== undefined)
      fields.Contract_term = data.Contract_term;
    if (data.Is_the_owner_considering_selling_the_apartment !== undefined)
      fields.Is_the_owner_considering_selling_the_apartment =
        data.Is_the_owner_considering_selling_the_apartment;
    if (data.Last_rental_price !== undefined)
      fields.Last_rental_price = data.Last_rental_price;
    if (data.Recommended_price !== undefined)
      fields.Recommended_price = data.Recommended_price;
    if (data.Asking_price !== undefined)
      fields.Asking_price = data.Asking_price;
    if (data.Defects_and_repairs_to_be_carried_out !== undefined)
      fields.Defects_and_repairs_to_be_carried_out =
        data.Defects_and_repairs_to_be_carried_out;
    if (data.General_comments !== undefined)
      fields.General_comments = data.General_comments;

    const response = await fetch(
      `https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/${encodeURIComponent(
        import.meta.env.VITE_PROPERTYTABLE,
      )}/${recordId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    return response.json();
  };

  const handleSave = async () => {
    try {
      if (!id) return;

      await updatePropertyDirect(id, form);

      alert("Property updated successfully");

      navigate(`/property/${id}`);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update property");
    }
  };

  // ---------- UI ----------
  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold">Edit Property</h1>

        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SELECT FIELDS */}
            <InputField
              onChange={handleChange}
              value={form.Meeting_Date}
              label="תאריך פגישה"
              field="Meeting_Date"
              type="date"
            />
            <SelectField
              label="סוכן"
              field="Agent"
              options={["עידן", "גלעד", "איתמר", "יונתן"]}
            />
            <SelectField
              label="מיקום הפגישה"
              field="Meeting_Location"
              options={["בנכס", "מרחוק"]}
            />
            <InputField
              onChange={handleChange}
              value={form.Property_owner_name}
              label="שם בעל הנכס"
              field="Property_owner_name"
              type="text"
            />
            <InputField
              onChange={handleChange}
              value={form.Phone_Number}
              label="מספר טלפון *"
              field="Phone_Number"
              type="tel"
            />
            <InputField
              onChange={handleChange}
              value={form.Email}
              label="אֶלֶקטרוֹנִי"
              field="Email"
              type="email"
            />
            <InputField
              onChange={handleChange}
              value={form.Who_are_you_dealing_with}
              label="מול מי מתנהלים"
              field="Who_are_you_dealing_with"
              type="text"
            />
            <InputField
              onChange={handleChange}
              value={form.Property_Address}
              label="כתובת הנכס"
              field="Property_Address"
              type="text"
            />
            <SelectField
              label="באיזה איזור הנכס"
              field="In_which_area_is_the_property"
              options={[
                "הדר יוסף",
                "רמת אביב",
                "נאות אפקה",
                "המשתלה",
                "למד",
                "רמת החייל",
                "תל ברוך",
                "שיכון דן",
                "הגוש הגדול",
                "כוכב הצפון",
                "סביוני רמת אביב",
                "נווה אביבים",
                "צמרות",
                "בבלי",
                "הצפון הישן",
                "כיכר המדינה",
                "כיכר רבין",
                "קרית הממשלה",
                "הבימה",
                "לב העיר",
                "נווה צדק",
                "פלורנטין",
                "יד אליהו",
                "נחלת יצחק",
                "ביצרון",
                "מגדלי הצעירים",
                "מגדלי מידטאון",
              ]}
            />
            <InputField
              onChange={handleChange}
              value={form.Floor}
              label="קומה"
              field="Floor"
              type="number"
            />
            <InputField
              onChange={handleChange}
              value={form.How_many_floors_in_the_building}
              label="כמה קומות בבניין"
              field="How_many_floors_in_the_building"
              type="number"
            />
            <InputField
              onChange={handleChange}
              value={form.How_many_apartments_in_the_building}
              label="מספר דירות בבניין"
              field="How_many_apartments_in_the_building"
              type="number"
            />
            <InputField
              onChange={handleChange}
              value={form.Area_registered_in_Arnona}
              label="שטח רשום בארנונה"
              field="Area_registered_in_Arnona"
              type="number"
            />
            <InputField
              onChange={handleChange}
              value={form.Actual_area}
              label="שטח בפועל"
              field="Actual_area"
              type="number"
            />
            <SelectField
              label="מספר חדרים"
              field="How_many_rooms"
              options={[
                "1 חדרים",
                "1.5 חדרים",
                "2 חדרים",
                "2.5 חדרים",
                "3 חדרים",
                "3.5 חדרים",
                "4 חדרים",
                "4.5 חדרים",
                "5 חדרים",
                "5.5 חדרים",
                "6 חדרים",
              ]}
            />
            <SelectField
              label="כיווני אוויר"
              field="Air_directions"
              options={["צפון", "מזרח", "דרום", "מערב"]}
            />
            <SelectField
              label="מעלית"
              field="Elevator"
              options={["כן", "לא", "כֵּן"]}
            />
            <SelectField
              label="סוג חניה"
              field="Parking_Type"
              options={[
                "אֵין חֲנִייָה",
                "חניה משותפת / על בסיס מקום פנוי",
                "חניה פרטית",
              ]}
            />
            <SelectField
              label="אפשר להוציא תו חניה"
              field="Can_I_get_a_parking_permit"
              options={["כן", "לא"]}
            />
            <InputField
              onChange={handleChange}
              value={form.Public_car_park_is_the_closest}
              label="חניון ציבורי הכי קרוב"
              field="Public_car_park_is_the_closest"
              type="text"
            />
            <SelectField
              label="יש מרפסת"
              field="Is_there_a_balcony"
              options={["כן", "לא"]}
            />
            <SelectField
              label="סוג מרפסת"
              field="Balcony_type"
              options={["שמש", "שירות", "סגורה"]}
            />
            <InputField
              onChange={handleChange}
              value={form.Balcony_size}
              label="גודל מרפסת"
              field="Balcony_size"
              type="text"
            />
            <SelectField
              label="אחסון"
              field="Storage"
              options={["מסתור כביסה", "בוידעם", "מחסן פרטי", "במרפסת שירות"]}
            />
            <SelectField
              label="מצב הדירה"
              field="The_condition_of_the_apartment"
              options={["משופצת", "חדשה מקבלן", "קטלוג", "שבורה", "חלקית"]}
            />
            <SelectField
              label="רמת תחזוקה בדירה"
              field="The_level_of_maintenance_in_the_apartment"
              options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
            />
            <SelectField
              label="ריהוט"
              field="Furniture"
              options={[
                "ארונות קיר",
                "סלון",
                "מכונת כביסה",
                "מייבש",
                "מדיח",
                "תנור",
                "כיריים",
                "מיטה",
                "מרוהטת קומפלט",
                "לא מרוהטת",
              ]}
            />
            <SelectField
              label="מיזוג אוויר"
              field="Air_conditioning"
              options={[
                "מיזוג מרכזי",
                "מיני מרכזי",
                "מרכזי עם דאמפרים",
                "עילי נפרד בכל איזור",
              ]}
            />
            <SelectField
              label="חיבור גז"
              field="Gas_connection"
              options={["כן", "לא", "ניתן להתקין"]}
            />
            <SelectField
              label="נגישות לנכים"
              field="Accessibility_to_properties"
              options={["כן", "לא", "ניתן ליצור נגישות"]}
            />
            <SelectField
              label="הדירה פנויה"
              field="Is_the_apartment_available"
              options={["Available", "NA", "Rented"]}
            />
            <InputField
              onChange={handleChange}
              value={form.Entry_date}
              label="תאריך כניסה"
              field="Entry_date"
              type="date"
            />
            <SelectField
              label="רחוב שקט"
              field="Quiet_street"
              options={["כן", "לא"]}
            />
            <InputField
              onChange={handleChange}
              value={form.Year_of_construction}
              label="שנת בניה"
              field="Year_of_construction"
              type="text"
            />
            <SelectField
              label="רמת תחזוקה בבניין"
              field="The_level_of_maintenance_in_the_building"
              options={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
            />
            <SelectField
              label="תמ׳׳א צמודה"
              field="Is_TAMA_attached"
              options={["כן", "לא", "ברחוב"]}
            />
            <SelectField
              label="הבניין בתהליך תמ׳׳א"
              field="Is_the_building_in_the_process_of_TAMA"
              options={["כן", "לא"]}
            />
            <SelectField
              label="מתי התמ׳׳א צפוי"
              field="When_is_the_TAMA_expected"
              options={[
                "שנה הקרובה",
                "שנתיים שלוש",
                "מדברים על זה וזה עוד רחוק",
                "לא מיועדת לתמ׳׳א",
              ]}
            />
            <InputField
              onChange={handleChange}
              value={form.Committee_of_the_House}
              label="ועד בית"
              field="Committee_of_the_House"
              type="text"
            />
            <InputField
              onChange={handleChange}
              value={form.Bi_monthly_municipal_taxes}
              label="ארנונה דו חודשי"
              field="Bi_monthly_municipal_taxes"
              type="text"
            />
            <SelectField
              label="תנאי תשלום"
              field="Payment_term"
              options={["חודש בחודשו", "גמיש"]}
            />
            <SelectField
              label="ערבות בנקאית"
              field="A_bank_guarantee"
              options={["חודש", "חודשיים", "3 חודשים"]}
            />
            <InputField
              onChange={handleChange}
              value={form.A_security_note_for_the_sum}
              label="שטר בטחון על סך"
              field="A_security_note_for_the_sum"
              type="text"
            />
            <SelectField
              label="ערבים לחוזה"
              field="Guarantors_to_the_contract"
              options={["ערב אחד", "שני ערבים"]}
            />
            <SelectField
              label="טווח חוזה"
              field="Contract_term"
              options={["שנה פלוס אופציה ", "שנתיים פלוס"]}
            />
            <SelectField
              label="האם הבעלים שוקל למכור את הדירה"
              field="Is_the_owner_considering_selling_the_apartment"
              options={["בטווח הקצר", "בטווח הרחוק", "בטווח הרחוק"]}
            />
            <InputField
              onChange={handleChange}
              value={form.Last_rental_price}
              label="מחיר השכרה אחרון"
              field="Last_rental_price"
              type="text"
            />
            <InputField
              onChange={handleChange}
              value={form.Recommended_price}
              label="מחיר מומלץ"
              field="Recommended_price"
              type="text"
            />
            <InputField
              onChange={handleChange}
              value={form.Asking_price}
              label="מחיר מבוקש"
              field="Asking_price"
              type="text"
            />
            <InputField
              onChange={handleChange}
              value={form.Defects_and_repairs_to_be_carried_out}
              label="ליקויים ותיקונים שיש לבצע"
              field="Defects_and_repairs_to_be_carried_out"
              type="text"
            />
            <InputField
              onChange={handleChange}
              value={form.General_comments}
              label="הערות כלליות"
              field="General_comments"
              type="text"
            />
          </CardContent>
        </Card>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>

          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </Layout>
  );
}
