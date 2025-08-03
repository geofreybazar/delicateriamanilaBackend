import { AddProductType } from "./validation";

export interface UpdateProductServiceType extends AddProductType {
  images: string[];
}
