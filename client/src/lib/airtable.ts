import type {
  Property,
  Tenant,
  AirtableResponse,
  AirtableRecord,
} from "./types";

const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;
const PropertyTable_id = import.meta.env.VITE_PROPERTYTABLE;
const TenantTable_id = import.meta.env.VITE_TENANTTABLE;
const TemplateTable_id = import.meta.env.VITE_TEMPLATETABLE; // add in .env


const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

function parseAirtableRecord<T>(record: AirtableRecord<T>): T & { id: string } {
  return {
    id: record.id,
    ...record.fields,
  };
}

/**
 * Fetch ALL records from an Airtable table (handles pagination)
 */
async function fetchAllRecords<T>(
  tableId: string
): Promise<(T & { id: string })[]> {
  const allRecords: (T & { id: string })[] = [];
  let offset: string | undefined;

  do {
    const url = new URL(`${BASE_URL}/${tableId}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airtable error:", errorText);
      throw new Error(`Failed to fetch records: ${response.status}`);
    }

    const data: AirtableResponse<T> = await response.json();

    allRecords.push(...data.records.map(parseAirtableRecord));
    offset = data.offset;
  } while (offset);

  return allRecords;
}

/* ----------------------------------------
   Properties
---------------------------------------- */

export async function fetchProperties(): Promise<Property[]> {
  try {
    return await fetchAllRecords<Omit<Property, "id">>(PropertyTable_id);
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
}

export async function fetchPropertyById(id: string): Promise<Property> {
  try {
    const response = await fetch(`${BASE_URL}/${PropertyTable_id}/${id}`, {
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airtable error:", errorText);
      throw new Error(`Failed to fetch property: ${response.status}`);
    }

    const record: AirtableRecord<Omit<Property, "id">> =
      await response.json();

    return parseAirtableRecord(record);
  } catch (error) {
    console.error("Error fetching property:", error);
    throw error;
  }
}

/* ----------------------------------------
   Tenants
---------------------------------------- */

export async function fetchTenants(): Promise<Tenant[]> {
  try {
    return await fetchAllRecords<Omit<Tenant, "id">>(TenantTable_id);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    throw error;
  }
}

export async function updateTenantMatchStatus(
  tenantId: string,
  // propertyId: string,
  // propertyName: string,
  // propertyUrl: string,
  existingNotes?: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  // const newNote = `[${timestamp}] Property matched: ${propertyName} (ID: ${propertyId})\nURL: ${propertyUrl}`;
  // const updatedNotes = existingNotes
  //   ? `${existingNotes}\n\n${newNote}`
  //   : newNote;

  try {
    const response = await fetch(`${BASE_URL}/${TenantTable_id}/${tenantId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        fields: {
          Match_Status: "Sent",
          Message: existingNotes,
        },
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airtable error:", errorText);
      throw new Error(`Failed to update tenant: ${response.status}`);
    }
  } catch (error) {
    console.error("Error updating tenant:", error);
    throw error;
  }
}

export async function createProperty(
  fields: Partial<Omit<Property, "id">>
): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/${PropertyTable_id}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        fields: {
          ...fields,
          Date_Added: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airtable error:", errorText);
      throw new Error(`Failed to create property: ${response.status}`);
    }
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
}

export async function deleteProperty(propertyId: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/${PropertyTable_id}/${propertyId}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable error:', errorText);
      throw new Error(`Failed to delete property: ${response.status}`);
    }
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
}

export const updateTenantAgent = async (
  tenantRecordId: string,
  agentName: string
) => {
  

  await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/tblw1ZUQxEm3iJkcX/${tenantRecordId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Agent_Name: agentName, // 🔴 Airtable column name
          Current_Status: "מוּצָע", // 🔴 Airtable column name
        },
      }),
    }
  );
};

export async function updatePropertyAvailability(
  recordId: string,
  status: "Available" | "NA"
) {
  const response = await fetch(
    `${BASE_URL}/${PropertyTable_id}/${recordId}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        fields: {
          Is_the_apartment_available: status,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}


/**
 * Save a template message in Airtable:
 * - If a row with templateKey exists → update Message
 * - If not → create new row
 */
export async function saveOrUpdateTemplateMessage(
  templateKey: string,
  message: string,
  Agent_Name:string
) {
  try {
    // 1️⃣ Check if template row exists
    const url = new URL(`${BASE_URL}/${TemplateTable_id}`);
    url.searchParams.set(
      "filterByFormula",
      `{Template_Key}='${templateKey}'`
    );

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      throw new Error(await res.text());
    }

    const data = await res.json() as AirtableResponse<{ Message: string, Template_Key: string }>;
    const existingRecord = data.records?.[0];

    // 2️⃣ If exists → update
    if (existingRecord) {
      const recordId = existingRecord.id;
      const updateRes = await fetch(`${BASE_URL}/${TemplateTable_id}/${recordId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          fields: { Message: message,
            Last_modified_by:Agent_Name
           }
        }),
      });

      if (!updateRes.ok) {
        throw new Error(await updateRes.text());
      }
      return { action: "updated", recordId };
    }

    // 3️⃣ If not exists → create
    const createRes = await fetch(`${BASE_URL}/${TemplateTable_id}`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        fields: { Template_Key: templateKey, Message: message },
      }),
    });

    if (!createRes.ok) {
      throw new Error(await createRes.text());
    }

    const createdRecord = await createRes.json();
    return { action: "created", recordId: createdRecord.id };

  } catch (error) {
    console.error("Error saving template message:", error);
    throw error;
  }
}

// Fetch the template message from Airtable
export async function fetchTemplateMessage() {
  try {
    const url = new URL(`${BASE_URL}/${TemplateTable_id}`);
    url.searchParams.set("filterByFormula", `{Template_Key}='default_property_message'`);

    const res = await fetch(url.toString(), { headers });
    const data = await res.json();
    return data.records?.[0]?.fields?.Message || "";
  } catch (err) {
    console.error("Failed to fetch template:", err);
    return "";
  }
}

export async function updateTenantStatus(tenantId: string, status: string) {
  const res = await fetch(`${BASE_URL}/${TenantTable_id}/${tenantId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: { Status: status },
    }),
  });

  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

/* -------- GET SINGLE TENANT -------- */
export async function fetchTenantById(id: string) {
  const res = await fetch(`${BASE_URL}/${TenantTable_id}/${id}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch tenant");
  }

  const data = await res.json();

  return {
    id: data.id,
    ...data.fields,
  };
}

/* -------- UPDATE TENANT -------- */
export async function updateTenant(id: string, fields: any) {
  const res = await fetch(`${BASE_URL}/${TenantTable_id}/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to update tenant");
  }

  return res.json();
}

export async function deleteTenant(tenantId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${TenantTable_id}/${tenantId}`, {
    method: "DELETE",
    headers,
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Airtable error:", errorText);
    throw new Error(`Failed to delete tenant: ${response.status}`);
  }
}



