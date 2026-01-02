import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { saveOrUpdateTemplateMessage } from "@/lib/airtable";
import { Layout } from "@/components/layout";

const TEMPLATE_KEY = "default_property_message";
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;
const TemplateTable_id = import.meta.env.VITE_TEMPLATETABLE; // add in .env

export default function TemplateEditorPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState(
    `Property Match Update\n\nHi ,\n\nWe found a property that matches your preferences.\n\nProperty: \n\nView details:\n\n\nPlease let us know if you are interested.\n\nRegards,\nProperty Team`
  );
  const [loading, setLoading] = useState(false);

  /* ---------- Load existing template ---------- */
  useEffect(() => {
    const loadTemplate = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${BASE_URL}/${TemplateTable_id}?filterByFormula=${encodeURIComponent(
            `{Template_Key}='${TEMPLATE_KEY}'`
          )}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await res.json();

        if (data.records && data.records.length > 0) {
          setMessage(data.records[0].fields?.Message || "");
        } else {
          setMessage("");
        }
      } catch (error) {
        console.error("Failed to load template:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, []);

  /* ---------- Save handler ---------- */
  const handleSave = async () => {
    setLoading(true);
    try {
      const uData = localStorage.getItem("userData");
      const userData = uData ? JSON.parse(uData) : { Name: "" };

      const result = await saveOrUpdateTemplateMessage(
        TEMPLATE_KEY,
        message,
        userData.Name
      );

      alert(`Template ${result.action} successfully!`);
    } catch (error) {
      console.error(error);
      alert("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Back handler ---------- */
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <h1 className="text-xl font-semibold">Edit Template Message</h1>

        <Textarea
          rows={12}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your template message here..."
        />

        <div className="flex gap-2">
          <Button onClick={handleBack} variant="secondary">
            Back
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
