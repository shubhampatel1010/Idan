/* -------------------- Property Type -------------------- */
/* -------------------- Property Type (Airtable) -------------------- */
interface AirtableAttachment {
  id: string;
  url: string;
  filename: string;
  width?: number;
  height?: number;
  size?: number;
  type?: string;
}

export interface Property {
  id: string; // Airtable record ID

  Submission_ID?: string;
  Meeting_Date?: string;
  Agent?: string;
  Meeting_Location?: string;

  Property_owner_name?: string;
  Phone_Number?: string;
  Email?: string;
  Who_are_you_dealing_with?: string;

  Property_Address?: string;
  Property_Image?: AirtableAttachment[];
  Floor?: number;
  How_many_floors_in_the_building?: number;
  How_many_apartments_in_the_building?: number;

  Area_registered_in_Arnona?: string;
  Actual_area?: number;
  How_many_rooms?: number;

  Air_directions?: string;
  Elevator?: boolean;
  Parking?: boolean;
  Can_I_get_a_parking_permit?: boolean;
  Public_car_park_is_the_closest?: boolean;

  Is_there_a_balcony?: boolean;
  Balcony_type?: string;
  Balcony_size?: string;

  Storage?: boolean;
  The_condition_of_the_apartment?: string;
  Furniture?: string;
  Air_conditioning?: boolean;
  Accessibility_to_properties?: string;

  Is_the_apartment_available?: string; // Available / Rented
  Entry_date?: string;
  Gas_connection?: boolean;
  Quiet_street?: boolean;

  Is_TAMA_attached?: boolean;
  Is_the_building_in_the_process_of_TAMA?: boolean;
  When_is_the_TAMA_expected?: string;

  Year_of_construction?: number;
  The_level_of_maintenance_in_the_building?: string;
  The_level_of_maintenance_in_the_apartment?: string;

  Last_rental_price?: number;
  Committee_of_the_House?: number;
  Bi_monthly_municipal_taxes?: number;

  Payment_term?: string;
  A_bank_guarantee?: boolean;
  A_security_note_for_the_sum?: string;
  Guarantors_to_the_contract?: boolean;
  Contract_term?: string;

  Is_the_owner_considering_selling_the_apartment?: boolean;
  Defects_and_repairs_to_be_carried_out?: string;
  General_comments?: string;

  Recommended_price?: number;
  Asking_price?: number;

  Latitude?: number;
  Longitude?: number;

  Created?: string;

  [key: string]: any; // Safety for future fields
}


/* -------------------- Tenant Type -------------------- */
export interface Tenant {
  id: string; // Airtable record ID

  Submission_ID?: string;
  Full_name?: string;
  Phone_number?: string;

  When_is_the_entry_date_set?: string;
  Number_of_Rooms?: string;
  How_old_will_you_be?: string;

  Current_budget?: string[];
  The_most_important_thing_to_me_in_the_apartment_is?: string;

  In_which_area_are_you_looking?: string; // Multi-select
  How_many_apartments_have_you_seen?: string;

  Requirement_decription?: string;
  Do_you_want_us_to_talk_on_the_phone?: string;

  Agent_Name?: string;
  Created?: string;

  [key: string]: any;
}

/* -------------------- Airtable Generic Types -------------------- */
export interface AirtableRecord<T> {
  id: string;
  fields: T;
  createdTime: string;
}

export interface AirtableResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

/* -------------------- Matching Types -------------------- */
export interface TenantMatch {
  tenant: Tenant;
  matchPercentage: number;
  matchedCriteria: string[];
}


/* -------------------- Filter Type -------------------- */
export interface PropertyFilters {
  tenantStatus: string;
  Status: string;
  minRent: number;
  maxRent: number;
  bedrooms: number;
  elevator: "כן" | "לא" | "חצי קומה" | null;
  parking: "פרטי" | "אין" | "משותף" | "עוקב" | "2 חניות" | null;
  balcony: "כן" | "לא" | null;
  availability: string;
}

