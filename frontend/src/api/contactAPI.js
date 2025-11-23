import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const BASE_URL = "https://logistic-backend-nu.vercel.app/api/contact";
//const BASE_URL = "http://localhost:3000/api/contact";

const fetchAPI = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP Error ${response.status}`);
    }

    const raw = await response.text();
    return raw ? JSON.parse(raw) : { success: true };
  } catch (err) {
    console.error("Contact API Error:", err);
    throw err;
  }
};

const contactAPI = {
  getContact: async () => {
    try {
      const result = await fetchAPI(BASE_URL);
      return {
        success: true,
        phone: result.phone,
        email: result.email,
      };
    } catch (error) {
      console.warn("Backend down → fallback Supabase.");
      return await contactAPI.supabase.getInfo();
    }
  },

  updateContact: async ({ phone_number, email }) => {
    try {
      return await fetchAPI(BASE_URL, {
        method: "PUT",
        body: JSON.stringify({ phone_number, email }),
      });
    } catch (error) {
      console.warn("Backend down → fallback Supabase update.");
      return await contactAPI.supabase.updateInfo({
        phone_number,
        email,
      });
    }
  },

  supabase: {
    getInfo: async () => {
      try {
        const { data, error } = await supabase
          .from("contact_info")
          .select("*")
          .eq("id", "primary")
          .single();

        if (error) throw error;

        return {
          success: true,
          phone: data.phone_number,
          email: data.email,
        };
      } catch {
        return { success: false, message: "Gagal fetch contact info" };
      }
    },

    updateInfo: async ({ phone_number, email }) => {
      try {
        const { error } = await supabase
          .from("contact_info")
          .update({
            phone_number,
            email,
            updated_at: new Date(),
          })
          .eq("id", "primary");

        if (error) throw error;

        return {
          success: true,
          message: "Contact info diupdate via Supabase",
        };
      } catch {
        return { success: false, message: "Gagal update contact info" };
      }
    },
  },

  utils: {
    validatePhone(number) {
      if (!number || number.trim() === "")
        return { isValid: false, message: "Nomor wajib diisi" };

      if (!/^\d{8,15}$/.test(number))
        return { isValid: false, message: "Nomor tidak valid" };

      return { isValid: true };
    },

    validateEmail(email) {
      if (!email || email.trim() === "")
        return { isValid: false, message: "Email wajib diisi" };

      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(email))
        return { isValid: false, message: "Email tidak valid" };

      return { isValid: true };
    },
  },
};

export default contactAPI;