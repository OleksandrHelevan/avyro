import {
  type DefaultValues,
  type FieldValues,
  FormProvider,
  type Resolver,
  type SubmitHandler,
  useForm,
  type UseFormReturn,
} from "react-hook-form";
import type { ReactNode } from "react";
import "./Form.css";

interface FormProps<T extends FieldValues> {
  children: (methods: UseFormReturn<T>) => ReactNode;
  onSubmit: SubmitHandler<T>;
  title?: string;
  subtitle?: string;
  className?: string;
  defaultValues?: DefaultValues<T>;
  resolver?: Resolver<T>;
}

export default function Form<T extends FieldValues>({
                                                      children,
                                                      onSubmit,
                                                      className,
                                                      defaultValues,
                                                      title,
                                                      subtitle,
                                                      resolver,
                                                    }: FormProps<T>) {
  const methods = useForm<T>({
    defaultValues,
    resolver,
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  return (
    <FormProvider {...methods}>
      <div className="form-card">
        {(title || subtitle) && (
          <div className="form-header-area">
            {title && <h2 className="form-card-title">{title}</h2>}
            {subtitle && <p className="form-card-subtitle">{subtitle}</p>}
          </div>
        )}

        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className={`form-main-content ${className || ""}`}
          noValidate
        >
          {children(methods)}
        </form>
      </div>
    </FormProvider>
  );
}
