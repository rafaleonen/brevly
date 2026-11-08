import { Header } from "@/features/components/header";
import { MyLinksContainer } from "@/features/container/my-links";
import { NewLinkContainer } from "@/features/container/new-link";

export function LinksPage() {
  return (
    <div className="mx-auto max-w-7xl w-full px-3 py-8 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-10 items-start gap-3 lg:gap-5 lg:gap-y-8">
        <Header className="lg:col-span-10 justify-center pb-3 lg:pb-0 lg:justify-start" />

        <NewLinkContainer className="lg:col-span-4" />

        <MyLinksContainer className="lg:col-span-6" />
      </div>
    </div>
  );
}
