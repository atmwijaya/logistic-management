import { ContactModel } from "../models/contactModel.js";

export const getContactInfo = async (req, res) => {
  try {
    const { data, error } = await ContactModel.getPhone();
    if (error) return res.status(400).json({ error });
    res.json({ 
      phone: data.phone_number, 
      email: data.email 
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateContactInfo = async (req, res) => {
  try {
    const { phone_number, email } = req.body;

    if (!phone_number) {
      return res.status(400).json({ error: "Nomor telepon wajib diisi" });
    }

    const { error } = await ContactModel.updatePhone(phone_number, email);
    if (error) return res.status(400).json({ error });

    res.json({ 
      success: true,
      message: "Kontak berhasil diperbarui" 
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};