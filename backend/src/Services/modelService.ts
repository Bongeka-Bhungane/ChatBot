import { supabase } from "../lib/supabase";
import { Model } from "../types/Model";

const DB_NAME = "Models";

//.................................... CRUD OPERATIONS............

export const createModelDB = async (model: Model) => {
  console.log(900, model);
  const { data, error } = await supabase
    .from(DB_NAME)
    .insert([model])
    .select()
    .single();

  console.log(901, data, error);
  if (error) {
    throw new Error(error.message);
  }
  return data;
};


// Fetch all the models from the database
export const getAllModelsDB = async () => {
  const { data, error } = await supabase.from(DB_NAME).select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// get a single models by ID
export const getModelByIdDB = async (id: string) => {
  const { data, error } = await supabase
    .from(DB_NAME)
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

// Delete the models from database
export const deleteModelDB = async (id: string) => {
  const { data, error } = await supabase
    .from(DB_NAME)
    .delete()
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};


// update the model details
export const updateModelDB = async (id: string, model: Partial<Model>) => {
  const { data, error } = await supabase
    .from(DB_NAME)
    .update(model)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    throw new Error(error.message);
  }
  return data;
};
