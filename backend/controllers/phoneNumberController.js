import { PhoneModel } from "../models/phoneNumberModel.js";

export const getPhoneNumber = async (req, res) => {
  const { data, error } = await PhoneModel.getPhone();
  if (error) return res.status(400).json({ error });
  res.json({ phone: data.phone_number });
};

export const updatePhoneNumber = async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number)
    return res.status(400).json({ error: "Nomor telepon wajib diisi" });

  const { error } = await PhoneModel.updatePhone(phone_number);
  if (error) return res.status(400).json({ error });

  res.json({ message: "Nomor telepon diperbarui" });
};
