import { useMutation } from "@tanstack/react-query";
import { userService } from "../service/userService.ts";
import toast from "react-hot-toast";

interface FeedbackParams {
  doctor_id: string;
  message: string;
  rating: number;
  visibility: string;
}

export const useCreateFeedback = () => {
  return useMutation({
    mutationFn: (data: FeedbackParams) => {
      return userService.createDoctorFeedback(data);
    },
    onSuccess: () => {
      toast.success("Ваш відгук успішно надіслано!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Помилка при відправці відгуку");
    },
  });
};
