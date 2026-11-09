import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { isValidUrl } from "@/shared/utils/validate-url";
import { useForm, type SubmitHandler } from "react-hook-form";
import { PREFIX } from "../constants/prefix";

interface FormValues {
  originalUrl: string;
  shortenedUrl: string;
}

export function NewLinkForm() {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      originalUrl: "",
      shortenedUrl: "",
    },
  });

  const shortenedUrlField = register("shortenedUrl", {
    required: "Link Encurtado é obrigatório!",
    pattern: {
      value: /^[a-zA-Z0-9_-]+$/,
      message: "Use apenas letras, números, hífen e underline.",
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => console.log(data);

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        id="originalUrl"
        label="Link Original"
        placeholder="www.exemplo.com.br"
        error={errors.originalUrl?.message}
        {...register("originalUrl", {
          required: "Link Original é obrigatório!",
          validate: (value) =>
            isValidUrl(value.trim()) || "Informe uma URL válida.",
        })}
      />

      <Input
        id="shortnedUrl"
        label="Link Encurtado"
        prefix={PREFIX}
        isFilled={!!watch("shortenedUrl")}
        error={errors.shortenedUrl?.message}
        {...shortenedUrlField}
        onChange={(event) => {
          event.target.value = event.target.value
            .replace(/\s+/g, "-")
            .replace(/[^a-zA-Z0-9_-]/g, "");
          shortenedUrlField.onChange(event);
        }}
      />

      <Button className="mt-2" type="submit">
        Salvar Link
      </Button>
    </form>
  );
}
