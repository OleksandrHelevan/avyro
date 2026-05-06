import { useQuery } from "@tanstack/react-query";
import {userService} from "../service/userService.ts";

export const useAdminSpecializations = () => {
  return useQuery({
    queryKey: ["adminSpecializations"],
    queryFn: () => userService.getAdminSpecializations(),
  });
};
