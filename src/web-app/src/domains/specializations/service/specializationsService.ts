import type {
  Specialization

} from "../types.ts";
import {specializationsApiClient} from "../api/specializationsApiClient.ts";
import {userApiClient} from "../../users/api/userApiClient.ts";

export const specializationService = {

  getAllSpecializations: async (): Promise<Specialization[]> => {
    return specializationsApiClient.getAllSpecializations();
  },

  getSpecializationById: async (spec_id: string): Promise<Specialization> => {
    return specializationsApiClient.getSpecializationById(spec_id);
  },


  createSpecializationDirect: async (data: { name: string }): Promise<any> => {
    return specializationsApiClient.createSpecializationDirect(data);
  },
  approveSpecialization: async (requestId: string): Promise<any> => {
    return userApiClient.approveSpecialization(requestId);
  },

};
