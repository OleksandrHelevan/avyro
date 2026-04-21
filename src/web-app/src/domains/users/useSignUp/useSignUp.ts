import {useMutation} from "@tanstack/react-query";
import type {SignUpRequest} from "../types.ts";
import {userService} from "../service/userService.ts";
import toast from "react-hot-toast";

export const useSignUp = () => {
  return useMutation({
    mutationFn: (data: SignUpRequest) => userService.signup(data),
    onSuccess: () => {
      toast.success(`Signup successful`);
    }
  });
};
