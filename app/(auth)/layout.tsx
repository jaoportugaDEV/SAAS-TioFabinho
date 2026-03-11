import { Lora } from "next/font/google";

const lora = Lora({ subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={lora.className}>
      {children}
    </div>
  );
}

