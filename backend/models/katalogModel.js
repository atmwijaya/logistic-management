import { supabase } from "../config/supabaseClient.js";

export const getAllKatalog = async () => {
  return await supabase
    .from("katalog")
    .select("*")
    .order("created_at", { ascending: false });
};

export const getKatalogById = async (id) => {
  return await supabase
    .from("katalog")
    .select("*")
    .eq("id", id)
    .single();
};

export const createKatalog = async (data) => {
  return await supabase
    .from("katalog")
    .insert([data])
    .select();
};

export const updateKatalog = async (id, data) => {
  return await supabase
    .from("katalog")
    .update(data)
    .eq("id", id)
    .select();
};

export const deleteKatalog = async (id) => {
  return await supabase
    .from("katalog")
    .delete()
    .eq("id", id);
};
