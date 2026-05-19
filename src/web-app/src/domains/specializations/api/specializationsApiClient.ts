import { apiClient } from "../../../services/apiService.ts";
import type { Specialization } from "../types.ts";

export const specializationsApiClient = {

  getAllSpecializations: async () =>
    apiClient.get<Specialization[]>('/specializations'),

  getSpecializationById: async (spec_id: string) =>
    apiClient.get<Specialization>(`/specializations/${spec_id}`),

  // 🚀 Перейменували: тепер це просто звичайне створення
  createSpecialization: async (data: { name: string }) => {
    return apiClient.post('/specializations', {
      name: data.name.trim(),
      description: "Запропоновано лікарем"
    });
  },
};
