import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {userService} from "../service/userService.ts";

export const useApproveRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => userService.approveRegistration(requestId),

    onSuccess: () => {
      toast.success("Реєстрацію лікаря успішно підтверджено!");
      // Автоматично оновлюємо список запитів, щоб картка зникла
      queryClient.invalidateQueries({ queryKey: ["adminRegistrations"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Не вдалося підтвердити реєстрацію");
    },
  });
};
