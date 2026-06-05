import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {adminService} from "../service/adminService.ts";

export const useCreateSpecializationDirect = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => adminService.createSpecializationDirect(data),
    onSuccess: () => {
      toast.success("Спеціалізацію успішно створено!");
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
    },
    onError: () => toast.error("Помилка створення спеціалізації"),
  });
};
