import { useMutation } from "@tanstack/react-query";
import { userService } from "../service/userService";
import type { ScheduleRequest } from "../../../types.ts";
import toast from "react-hot-toast";

export const useRequestSchedule = () => {
  return useMutation({
    mutationFn: (scheduleData: ScheduleRequest) =>
      userService.requestSchedule(scheduleData),
    onSuccess: () => {
      toast.success("Розклад успішно згенеровано!");
    },
    onError: () => {
      toast.error("Помилка при створенні розкладу. Перевірте дані.");
    }
  });
};
