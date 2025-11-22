import { supabase } from "../config/supabaseClient.js";

export const PhoneModel = {
  getPhone() {
    return supabase
      .from("contact_phone")
      .select("*")
      .eq("id", "primary")
      .single();
  },

  updatePhone(phone_number) {
    return supabase
      .from("contact_phone")
      .update({
        phone_number,
        updated_at: new Date(),
      })
      .eq("id", "primary");
  },
};