import { useIncrementShortLinkClickMutation } from "@/features/mutations/increment-short-link-click-by-slug";
import logoIcon from "@/shared/assets/svg/logo_icon.svg";
import { Typography } from "@/shared/ui/typography";
import { useEffect, useRef } from "react";
import { Navigate, useSearchParams } from "react-router";

export function RedirectPage() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");

  const hasStarted = useRef(false);
  const {
    mutateAsync: incrementShortLinkClick,
    data,
    isError,
  } = useIncrementShortLinkClickMutation();

  useEffect(() => {
    if (!slug || hasStarted.current) return;
    hasStarted.current = true;

    incrementShortLinkClick(slug).then((shortLink) => {
      window.location.replace(shortLink.originalUrl);
    });
  }, [slug, incrementShortLinkClick]);

  if (!slug || isError) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <div className="flex items-center justify-between h-full w-full px-4">
      <div className="w-full max-w-145 px-12 py-16 flex flex-col gap-6 m-auto bg-white rounded-lg items-center">
        <img src={logoIcon} alt="brev.ly" className="h-12" />

        <Typography variant="xl">Redirecionando...</Typography>

        <div className="text-center flex flex-col gap-2">
          <Typography variant="md">
            O link será aberto automaticamente em alguns instantes.
          </Typography>
          <Typography variant="md">
            Não foi redirecionado?{" "}
            <a href={data.originalUrl} className="text-blue-base underline">
              Acesse aqui
            </a>
          </Typography>
        </div>
      </div>
    </div>
  );
}
