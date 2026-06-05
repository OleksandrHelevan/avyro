import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {adminService} from "../service/adminService.ts";

export const useApproveSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: string) => adminService.approveSchedule(scheduleId),
    onSuccess: () => {
      toast.success("Розклад підтверджено!");
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
    },
    onError: () => toast.error("Помилка підтвердження розкладу"),
  });
};
