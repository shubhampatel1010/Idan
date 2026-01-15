import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { fetchTenantById, updateTenant } from "@/lib/airtable";

/* ---------------- BUDGET OPTIONS ---------------- */

const BUDGET_OPTIONS = [
  "עד 5,000₪",
  "עד 6,000₪",
  "עד 7,000₪",
  "עד 8,000₪",
  "עד 9,000₪",
  "עד 10,000₪",
  "עד 12,000₪",
  "עד 14,000₪",
  "עד 16,000₪",
  "עד 18,000₪",
  "עד 20,000₪",
  "עד 25,000₪",
];

const ROOM_OPTIONS = [
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
];

const IMPORTANT_OPTIONS = [
  "מרפסת",
  "חנייה פרטית",
  "כיווני אוויר",
  "שקיעות",
  "משופצת",
  "שקט",
  "מעלית חובה",
  "מרחב מוגן",
  "שטח חיצוני",
  "נוף פתוח",
  "מרוהטת",
  "שירותים כפולים",
];

const AREA_OPTIONS = [
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
  "כיכר דיזנגוף",
  "הצפון החדש",
  "כרם התימנים",
  "רמת אביב החדשה",
  "צפון יפו",
  "שכונת ל׳",
  "נאות אפקה א׳",
  "נווה שאנן",
  "יד אליהו",
  "נחלת יצחק",
  "ביצרון",
  "מגדלי הצעירים",
  "מגדלי מידטאון",
];

/* ---------------- COMPONENT ---------------- */

export default function TenantEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  /* ---------------- FORM STATE ---------------- */

  const [form, setForm] = useState<any>({
    Full_name: "",
    Phone_number: "",
    When_is_the_entry_date_set: "",
    Number_of_Rooms: [], // 🔴 CHANGED
    How_old_will_you_be: "",
    Current_budget: [],
    Status: "Active",
    The_most_important_thing_to_me_in_the_apartment_is: [], // 🔴 CHANGED
    In_which_area_are_you_looking: [], // 🔴 CHANGED
    How_many_apartments_have_you_seen: "",
    Do_you_want_us_to_talk_on_the_phone: "",
    Requirement_decription: "",
    Elevator: "", // 🔹 new
    Parking: "", // 🔹 new
    Assigned_Agent: "", // 🔹 new
  });

  /* ---------------- FETCH TENANT ---------------- */

  const { data, isLoading } = useQuery({
    queryKey: ["tenant", id],
    queryFn: () => fetchTenantById(id!),
    enabled: !!id,
  });

  /* ---------------- PREFILL FORM ---------------- */

  useEffect(() => {
    if (data) {
      setForm({
        Full_name: data.Full_name || "",
        Phone_number: data.Phone_number || "",
        When_is_the_entry_date_set: data.When_is_the_entry_date_set || "",

        Number_of_Rooms: Array.isArray(data.Number_of_Rooms)
          ? data.Number_of_Rooms
          : data.Number_of_Rooms
          ? [data.Number_of_Rooms]
          : [],

        How_old_will_you_be: data.How_old_will_you_be || "",

        Current_budget: Array.isArray(data.Current_budget)
          ? data.Current_budget
          : data.Current_budget
          ? [data.Current_budget]
          : [],

        Status: data.Status || "Active",

        The_most_important_thing_to_me_in_the_apartment_is: Array.isArray(
          data.The_most_important_thing_to_me_in_the_apartment_is
        )
          ? data.The_most_important_thing_to_me_in_the_apartment_is
          : data.The_most_important_thing_to_me_in_the_apartment_is
          ? [data.The_most_important_thing_to_me_in_the_apartment_is]
          : [],

        In_which_area_are_you_looking: Array.isArray(
          data.In_which_area_are_you_looking
        )
          ? data.In_which_area_are_you_looking
          : data.In_which_area_are_you_looking
          ? [data.In_which_area_are_you_looking]
          : [],

        How_many_apartments_have_you_seen:
          data.How_many_apartments_have_you_seen || "",
        Do_you_want_us_to_talk_on_the_phone:
          data.Do_you_want_us_to_talk_on_the_phone || "",
        Requirement_decription: data.Requirement_decription || "",

        Elevator: data.Elevator || "",
        Parking: data.Parking || "",
        Assigned_Agent: data.Assigned_Agent || "",
      });
    }
  }, [data]);

  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validation: require at least one checkbox in multi-selects
    const multiSelectFields = [
      { field: "Number_of_Rooms", label: "Number of Rooms" },
      { field: "Current_budget", label: "Current Budget" },
      {
        field: "The_most_important_thing_to_me_in_the_apartment_is",
        label: "Most Important Things",
      },
      {
        field: "In_which_area_are_you_looking",
        label: "Area You Are Looking In",
      },
    ];

    for (const item of multiSelectFields) {
      if (!form[item.field] || form[item.field].length === 0) {
        alert(`Please select at least one option for "${item.label}"`);
        return; // Stop form submission
      }
    }
    setSaving(true);

    try {
      await updateTenant(id!, { ...form });
      navigate("/tenants");
    } catch (error) {
      console.error(error);
      alert("Failed to update tenant");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <p className="p-4">Loading tenant...</p>
      </Layout>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-6">ערוך דייר</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              סוכן מוקצה?
            </label>
            <select
              name="Assigned_Agent"
              value={form.Assigned_Agent}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select</option>
              <option value="עידן">עידן</option>
              <option value="גלעד">גלעד</option>
              <option value="איתמר">איתמר</option>
              <option value="יונתן">יונתן</option>
            </select>
          </div>
          {/* FULL NAME */}
          <div>
            <label className="block text-sm font-medium mb-1">שם מלא</label>
            <input
              name="Full_name"
              value={form.Full_name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* PHONE NUMBER */}
          <div>
            <label className="block text-sm font-medium mb-1">
              מספר טלפון
            </label>
            <input
              name="Phone_number"
              value={form.Phone_number}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* ENTRY DATE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              למתי מכוונים מועד כניסה?
            </label>
            <select
              name="When_is_the_entry_date_set"
              value={form.When_is_the_entry_date_set}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select</option>
              <option value="גמיש">גמיש</option>
              <option value="מיידי">מיידי</option>
            </select>
          </div>

          {/* ROOMS */}
          <div>
            <label className="block text-sm font-medium mb-2">
              כמה חדרים
            </label>

            <div className="border rounded p-3 space-y-2">
              {ROOM_OPTIONS.map((room) => (
                <label key={room} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.Number_of_Rooms.includes(room)}
                    onChange={(e) => {
                      setForm((prev: any) => {
                        const current = prev.Number_of_Rooms || [];
                        return {
                          ...prev,
                          Number_of_Rooms: e.target.checked
                            ? [...current, room]
                            : current.filter((v: string) => v !== room),
                        };
                      });
                    }}
                  />
                  {room}
                </label>
              ))}
            </div>
          </div>

          {/* AGE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              כמה תהיו?
            </label>
            <select
              name="How_old_will_you_be"
              value={form.How_old_will_you_be}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select</option>
              <option value="אנחנו זוג">אנחנו זוג</option>
              <option value="אני לבד">אני לבד</option>
              <option value="שותפים">שותפים</option>
              <option value="זוג פלוס">זוג פלוס</option>
            </select>
          </div>

          {/* BUDGET MULTI SELECT */}
          <div>
            <label className="block text-sm font-medium mb-2">
              תקציב נוכחי
            </label>

            <div className="border rounded p-3 max-h-56 overflow-y-auto space-y-2">
              {BUDGET_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.Current_budget.includes(option)}
                    onChange={(e) => {
                      setForm((prev: any) => {
                        const current = prev.Current_budget || [];
                        return {
                          ...prev,
                          Current_budget: e.target.checked
                            ? [...current, option]
                            : current.filter((v: string) => v !== option),
                        };
                      });
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          {/* AREA */}
          <div>
            <label className="block text-sm font-medium mb-2">
              באיזה איזור אתם מחפשים
            </label>

            <div className="border rounded p-3 space-y-2 max-h-56 overflow-y-auto">
              {AREA_OPTIONS.map((area) => (
                <label key={area} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.In_which_area_are_you_looking.includes(area)}
                    onChange={(e) => {
                      setForm((prev: any) => {
                        const current =
                          prev.In_which_area_are_you_looking || [];
                        return {
                          ...prev,
                          In_which_area_are_you_looking: e.target.checked
                            ? [...current, area]
                            : current.filter((v: string) => v !== area),
                        };
                      });
                    }}
                  />
                  {area}
                </label>
              ))}
            </div>
          </div>

          {/* IMPORTANT THING */}
          <div>
            <label className="block text-sm font-medium mb-2">
               חשוב לי שיהיה (אפשר לבחור כמה אפשרויות)
            </label>

            <div className="border rounded p-3 space-y-2">
              {IMPORTANT_OPTIONS.map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.The_most_important_thing_to_me_in_the_apartment_is.includes(
                      item
                    )}
                    onChange={(e) => {
                      setForm((prev: any) => {
                        const current =
                          prev.The_most_important_thing_to_me_in_the_apartment_is ||
                          [];
                        return {
                          ...prev,
                          The_most_important_thing_to_me_in_the_apartment_is: e
                            .target.checked
                            ? [...current, item]
                            : current.filter((v: string) => v !== item),
                        };
                      });
                    }}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {/* APARTMENTS SEEN */}
          <div>
            <label className="block text-sm font-medium mb-1">
              כמה דירות ראיתם?
            </label>
            <select
              name="How_many_apartments_have_you_seen"
              value={form.How_many_apartments_have_you_seen}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select</option>
              <option value="ראיתי 3-10 דירות">ראיתי 3-10 דירות</option>
              <option value="עדיין לא ראיתי דירות">עדיין לא ראיתי דירות</option>
              <option value="ראיתי יותר מ-10 דירות">
                ראיתי יותר מ-10 דירות
              </option>
              <option value="ראיתי פחות מ-3 דירות">ראיתי פחות מ-3 דירות</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">האם נדרשת מעלית?</label>
            <select
              name="Elevator"
              value={form.Elevator}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select</option>
              <option value="כן">כן</option>
              <option value="לא">לא</option>
              <option value="מקומה 2 ומעלה - חובה במעלית">מקומה 2 ומעלה - חובה במעלית</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">כמה חשובה לכם החניה?</label>
            <select
              name="Parking"
              value={form.Parking}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded"
            >
              <option value="">Select</option>
              <option value="חייבת חניה (ללא חניה זה לא רלוונטי)">חייבת חניה (ללא חניה זה לא רלוונטי)</option>
              <option value="רצוי שתהיה חניה אך לא חובה">רצוי שתהיה חניה אך לא חובה</option>
              <option value="אין צורך בחניה">אין צורך בחניה</option>
              
            </select>
          </div>

          {/* REQUIREMENT */}
          <div>
            <label className="block text-sm font-medium mb-1">
              פה תוכלו לכתוב לנו בסגנון שלכם ובדרך שלכם מה בדיוק אתם מחפשים
            </label>
            <textarea
              name="Requirement_decription"
              value={form.Requirement_decription}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* PHONE CALL */}
          <div>
            <label className="block text-sm font-medium mb-1">
              לא נוח לך השאלון? רוצים שנדבר בטלפון?
            </label>
            <select
              name="Do_you_want_us_to_talk_on_the_phone"
              value={form.Do_you_want_us_to_talk_on_the_phone}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select</option>
              <option value="דווקא אחלה שאלון מחכים שתמצאו לנו דירה!">
                דווקא אחלה שאלון מחכים שתמצאו לנו דירה!
              </option>
              <option value="כן בבקשה">כן בבקשה</option>
            </select>
          </div>

          {/* STATUS */}
          <div>
            <label className="block text-sm font-medium mb-1">סטָטוּס</label>
            <select
              name="Status"
              value={form.Status}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded"
            >
              {saving ? "Updating..." : "Update Tenant"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/tenants")}
              className="border px-6 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
