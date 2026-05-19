import {apiClient} from "../../../services/apiService.ts";
import type {

  Specialization,

} from "../types.ts";

export const specializationsApiClient = {

  getAllSpecializations: async () =>
    apiClient.get<Specialization[]>('/specializations'),

  getSpecializationById: async (spec_id: string) =>
    apiClient.get<Specialization>(`/specializations/${spec_id}`),

  createSpecializationDirect: async (data: { name: string }) => {
    console.log("Відправка на бекенд:", data.name);
    return apiClient.post('/admin/specialization', {
      name: data.name.trim(),
      description: "Створено адміністратором"
    });
  },
}
