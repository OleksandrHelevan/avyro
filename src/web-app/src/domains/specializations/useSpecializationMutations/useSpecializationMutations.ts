import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {specializationService} from "../service/specializationsService.ts";

export const useCreateSpecializationDirect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => specializationService.createSpecializationDirect(data),
    onSuccess: () => {
      toast.success("Спеціалізацію успішно створено!");
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
    },
    onError: () => toast.error("Помилка створення спеціалізації"),
  });
};

export const useApproveSpecialization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => specializationService.approveSpecialization(requestId),
    onSuccess: () => {
      toast.success("Запит на спеціалізацію підтверджено!");
      queryClient.invalidateQueries({ queryKey: ["adminSpecializations"] });
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
    },
    onError: () => toast.error("Помилка підтвердження"),
  });
};
