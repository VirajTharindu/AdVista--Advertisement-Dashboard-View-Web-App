import { Toaster } from "sonner";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Toaster position="top-right" theme="dark" richColors />
            {children}
        </>
    );
}
