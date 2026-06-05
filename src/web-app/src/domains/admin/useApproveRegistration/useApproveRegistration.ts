import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {adminService} from "../service/adminService.ts";

export const useApproveRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => adminService.approveRegistration(requestId),

    onSuccess: () => {
      toast.success("Реєстрацію лікаря успішно підтверджено!");
      queryClient.invalidateQueries({ queryKey: ["adminRegistrations"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Не вдалося підтвердити реєстрацію");
    },
  });
};
