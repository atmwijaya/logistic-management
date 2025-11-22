// phoneAPI.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BASE_URL = "http://localhost:3000/api/phone";

const fetchAPI = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP Error ${response.status}`);
    }

    const raw = await response.text();
    return raw ? JSON.parse(raw) : { success: true, data: null };
  } catch (error) {
    console.error("Phone API Error:", error);
    throw error;
  }
};

const phoneAPI = {
  getPhone: async () => {
    try {
      const result = await fetchAPI(BASE_URL);
      return {
        success: true,
        data: result.phone,
      };
    } catch (error) {
      console.warn("Backend down. Fallback to Supabase.");
      return await phoneAPI.supabase.getPhone();
    }
  },

  updatePhone: async (phone_number) => {
    try {
      const result = await fetchAPI(BASE_URL, {
        method: "PUT",
        body: JSON.stringify({ phone_number }),
      });

      return result;
    } catch (error) {
      console.warn("Backend down. Fallback to Supabase update.");
      return await phoneAPI.supabase.updatePhone(phone_number);
    }
  },

  supabase: {
    getPhone: async () => {
      try {
        const { data, error } = await supabase
          .from("contact_phone")
          .select("*")
          .eq("id", "primary")
          .single();

        if (error) throw error;

        return { success: true, data: data.phone_number };
      } catch (err) {
        return {
          success: false,
          message: "Gagal mengambil nomor telepon dari Supabase",
        };
      }
    },

    updatePhone: async (phone_number) => {
      try {
        const { error } = await supabase
          .from("contact_phone")
          .update({
            phone_number,
            updated_at: new Date(),
          })
          .eq("id", "primary");

        if (error) throw error;

        return {
          success: true,
          message: "Nomor berhasil di-update (fallback Supabase)",
        };
      } catch (err) {
        return {
          success: false,
          message: "Gagal update nomor telepon (Supabase fallback)",
        };
      }
    },
  },

  utils: {
    validatePhone: (number) => {
      if (!number || number.trim() === "") {
        return { isValid: false, message: "Nomor telepon wajib diisi" };
      }
      if (!/^\d{8,15}$/.test(number)) {
        return { isValid: false, message: "Nomor tidak valid" };
      }
      return { isValid: true };
    }
  }
};

export default phoneAPI;
