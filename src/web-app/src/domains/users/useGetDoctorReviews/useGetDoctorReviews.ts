import { useQuery } from "@tanstack/react-query";
import { userService } from "../service/userService.ts";

export const useGetDoctorReviews = (doctorId: string) => {
  return useQuery({
    queryKey: ["doctor-reviews", doctorId],
    queryFn: () => userService.getDoctorReviews(doctorId),
    enabled: !!doctorId, // Запит виконається, тільки якщо є ID
  });
};
