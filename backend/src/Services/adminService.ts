import { supabase } from "../lib/supabase";
import { Admin } from "../types/admin";

export const getAdminsDB = async () => {
  const { data, error } = await supabase.from("Admins").select("*");
  if (error) {
    console.error("Error fetching admins:", error);
    return [];
  }
  console.log(1001, data);
  return data;
};

export const getAdminByIdDB = async (id: string) => {
  const { data, error } = await supabase
    .from("Admins")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Error fetching admin:", error);
    return null;
  }

  return data;
};

export const addAdminDB = async (admin: Admin) => {
  const { data, error } = await supabase.from("Admins").insert([admin]);
  if (error) {
    console.error("Error adding admin:", error);
    return null;
  }
  return data;
};

export const loginAdminDB = async (email: string, password: string) => {
  const { data, error } = await supabase
    .from("Admins") 
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .single();
  if (error) {
    console.error("Error logging in admin:", error);
    return null;
  }
  return data;
};


export const updateAdminDB = async (id: string, admin: Partial<Admin>) => {
  const { data, error } = await supabase
    .from("Admins")
    .update(admin)
    .eq("id", id);
  if (error) {
    console.error("Error updating admin:", error);
    return null;
  }
  return data;
};

export const deleteAdminDB = async (id: string) => {
  const { data, error } = await supabase.from("Admins").delete().eq("id", id);
  if (error) {
    console.error("Error deleting admin:", error);
    return null;
  }
  return data;
};
