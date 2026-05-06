import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {userService} from "../service/userService.ts";

export const useApproveSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: string) => userService.approveSchedule(scheduleId),
    onSuccess: () => {
      toast.success("Розклад підтверджено!");
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
    },
    onError: () => toast.error("Помилка підтвердження розкладу"),
  });
};
