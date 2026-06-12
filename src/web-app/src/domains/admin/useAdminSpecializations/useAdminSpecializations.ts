import { useQuery } from "@tanstack/react-query";
import {adminService} from "../service/adminService.ts";

export const useAdminSpecializations = () => {
  return useQuery({
    queryKey: ["adminSpecializations"],
    queryFn: () => adminService.getAdminSpecializations(),
  });
};
