import notFound from "@/shared/assets/svg/404.svg";
import { Typography } from "@/shared/ui/typography";
import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="flex items-center justify-between h-full w-full px-4">
      <div className="w-full max-w-145 px-12 py-16 flex flex-col gap-6 m-auto bg-white rounded-lg items-center">
        <img src={notFound} alt="brev.ly" className="h-21.25" />

        <Typography variant="xl">Link não encontrado</Typography>

        <Typography variant="md" className="text-center leading-5.5">
          O link que você está tentando acessar não existe, foi removido ou é
          uma URL inválida. Saiba mais em{" "}
          <Link to="/" className="text-blue-base underline">
            brev.ly
          </Link>
        </Typography>
      </div>
    </div>
  );
}
