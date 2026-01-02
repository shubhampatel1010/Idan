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

export async function fetchProperties(): Promise<Property[]> {
  try {
    const response = await fetch(`${BASE_URL}/${PropertyTable_id}`, {
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airtable error:", errorText);
      throw new Error(`Failed to fetch properties: ${response.status}`);
    }
    const data: AirtableResponse<Omit<Property, "id">> = await response.json();
    return data.records.map(parseAirtableRecord);
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
    const record: AirtableRecord<Omit<Property, "id">> = await response.json();
    return parseAirtableRecord(record);
  } catch (error) {
    console.error("Error fetching property:", error);
    throw error;
  }
}

export async function fetchTenants(): Promise<Tenant[]> {
  try {
    const response = await fetch(`${BASE_URL}/${TenantTable_id}`, { headers });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Airtable error:", errorText);
      throw new Error(`Failed to fetch tenants: ${response.status}`);
    }
    const data: AirtableResponse<Omit<Tenant, "id">> = await response.json();
    return data.records.map(parseAirtableRecord);
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
        },
      }),
    }
  );
};

