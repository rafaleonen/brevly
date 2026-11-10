import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { isValidUrl } from "@/shared/utils/validate-url";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import z from "zod";
import { PREFIX } from "../constants/prefix";
import type { CreateShortLink } from "../mutations/create-short-link";

interface FormValues {
  originalUrl: string;
  shortenedUrl: string;
}

interface NewLinkFormProps {
  onSubmit: (values: CreateShortLink) => void;
}

const newLinkSchema = z.object({
  originalUrl: z
    .string()
    .trim()
    .min(1, "Link Original é obrigatório!")
    .refine(isValidUrl, "Informe uma URL válida."),
  shortenedUrl: z
    .string()
    .trim()
    .min(1, "Link Encurtado é obrigatório!")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Use apenas letras, números, hífen e underline."
    ),
});

export function NewLinkForm({ onSubmit }: NewLinkFormProps) {
  const {
    register,
    watch,
    handleSubmit: hookFormHandleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(newLinkSchema),
    defaultValues: {
      originalUrl: "",
      shortenedUrl: "",
    },
  });

  const shortenedUrlField = register("shortenedUrl");

  const handleSubmit: SubmitHandler<FormValues> = (data) => {
    onSubmit({
      originalUrl: data.originalUrl,
      slug: data.shortenedUrl,
    });
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={hookFormHandleSubmit(handleSubmit)}
    >
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
