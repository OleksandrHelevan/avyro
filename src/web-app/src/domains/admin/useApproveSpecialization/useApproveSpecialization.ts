import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {adminService} from "../service/adminService.ts";

export const useApproveSpecialization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => adminService.approveSpecialization(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSpecializations"] });
      toast.success("Спеціалізацію успішно схвалено!");
    },
    onError: (error: any) => {
      console.error("Помилка при апруві спеціалізації:", error);
      toast.error("Помилка: не вдалося схвалити спеціалізацію");
    },
  });
};
