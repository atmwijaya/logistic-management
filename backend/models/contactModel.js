import { supabase } from "../config/supabaseClient.js";

export const ContactModel = {
  getPhone() {
    return supabase
      .from("contact_info")
      .select("*")
      .eq("id", "primary")
      .single();
  },

  updatePhone(phone_number, email) {
    return supabase
      .from("contact_info")
      .update({
        phone_number,
        email,
        updated_at: new Date(),
      })
      .eq("id", "primary");
  },
};