import type { Specialization } from "../types.ts";
import { specializationsApiClient } from "../api/specializationsApiClient.ts";

export const specializationService = {

  getAllSpecializations: async (): Promise<Specialization[]> => {
    return specializationsApiClient.getAllSpecializations();
  },

  getSpecializationById: async (spec_id: string): Promise<Specialization> => {
    return specializationsApiClient.getSpecializationById(spec_id);
  },

  createSpecialization: async (data: { name: string }): Promise<any> => {
    return specializationsApiClient.createSpecialization(data);
  },

};
