import StoreSettings from "./model";
import { ValidationError } from "../../config/ValidationError";
import { StoreSettingsType, storeSettingsSchema } from "./validation";
import { revalidateTag } from "../../config/revalidateTag";

const addStoreSettingsService = async (body: StoreSettingsType) => {
  const parsed = storeSettingsSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Invalid Data Inputs");
  }

  const data = parsed.data;

  const savedStoreSettings = await StoreSettings.create(data);
  return savedStoreSettings;
};

const getStoreSettingsService = async (id: string) => {
  if (!id) {
    throw new ValidationError("No StoreSettings Id");
  }

  const storeSettings = await StoreSettings.findById(id);
  return storeSettings;
};

const updateStoreSettingsService = async (
  id: string,
  body: StoreSettingsType
) => {
  if (!id) {
    throw new ValidationError("No StoreSettings Id");
  }
  const parsed = storeSettingsSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError("Invalid Data Inputs");
  }

  const data = parsed.data;

  const updatedStoreSettings = await StoreSettings.findByIdAndUpdate(id, data);
  await revalidateTag("storesettings");
  return updatedStoreSettings;
};

export default {
  addStoreSettingsService,
  getStoreSettingsService,
  updateStoreSettingsService,
};
