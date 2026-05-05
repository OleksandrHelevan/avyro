import { useMutation } from "@tanstack/react-query";
import type { LoginRequest, LoginResponse } from "../types.ts";
import { setInStorage } from "../../../utils/localStorageUtil.ts";
import { userService } from "../service/userService.ts";
import toast from "react-hot-toast";

export const useLogin = () => {

  return useMutation({
    mutationFn: (data: LoginRequest) => userService.login(data),
    onSuccess: (response: LoginResponse) => {
      // 1. Зберігаємо дані
      setInStorage("accessToken", response.accessToken);
      setInStorage("userId", response.userId);

      // 2. Додаємо унікальний id.
      // Це гарантує: якщо функція викличеться двічі,
      // бібліотека просто оновить існуючий тост замість створення нового.
      toast.success("Вхід успішний!", { id: "login-success" });
    },

  });
};
