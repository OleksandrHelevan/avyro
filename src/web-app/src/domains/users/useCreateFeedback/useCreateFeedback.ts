import {userService} from "../service/userService.ts";
import {useMutation} from "@tanstack/react-query";
import type {CreateFeedbackRequest} from "../types.ts";
import toast from "react-hot-toast";

export const useCreateFeedback = () => {
  return useMutation({
    mutationFn: ({ doctorId, data }: { doctorId?: string; data: CreateFeedbackRequest }) => {

      return userService.createFeedback(doctorId || "platform", data);
    },
    onSuccess: () => {
      toast.success("Ваш відгук успішно надіслано!");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Помилка при відправці відгуку";
      toast.error(msg);
    },
  });
};
