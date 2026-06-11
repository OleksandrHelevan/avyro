import { useQuery } from "@tanstack/react-query";
import { userService } from "../service/userService.ts";

export const useGetAllFeedback = () => {
  return useQuery({
    queryKey: ["all-feedbacks"],
    queryFn: () => userService.getAllFeedback(),
  });
};
