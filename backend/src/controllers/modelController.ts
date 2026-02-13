import { Request, Response } from "express";
import {
  createModelDB,
  deleteModelDB,
  getAllModelsDB,
  getModelByIdDB,
  updateModelDB,
} from "../Services/modelService";

export const getAllModels = async (req: Request, res: Response) => {
  try {
    const models = await getAllModelsDB();

    models
      ? res.json(models)
      : res.status(500).json({ error: "Failed to fetch models." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getModelById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const model = await getModelByIdDB(id);
    model
      ? res.json(model)
      : res.status(500).json({ error: "Failed to fetch model." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createModel = async (req: Request, res: Response) => {
  try {
    const model = await createModelDB(req.body);
    console.log(model);
    model
      ? res.json(model)
      : res.status(500).json({ error: "Failed to create model." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateModel = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const model = await updateModelDB(id, req.body);
    model
      ? res.json(model)
      : res.status(500).json({ error: "Failed to update model." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteModel = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  try {
    const model = await deleteModelDB(id);
    model
      ? res.json(model)
      : res.status(500).json({ error: "Failed to delete model." });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
